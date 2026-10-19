import pytest
from datetime import datetime, timedelta, timezone

import app.db.mongodb as mongodb_module

ADMIN_EMAIL = "admin@rentflow.app"
ADMIN_PASSWORD = "ChangeMe123!"

pytestmark = pytest.mark.asyncio


async def test_login_rejects_wrong_password(client, auth_headers):
    r = await client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


async def test_login_sets_http_only_cookie_without_returning_token(client, auth_headers):
    r = await client.post(
        "/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD, "remember": True}
    )
    assert r.status_code == 200
    assert "access_token" not in r.json()
    cookie = r.headers["set-cookie"]
    assert "rentflow_access_token=" in cookie
    assert "HttpOnly" in cookie
    assert "SameSite=lax" in cookie
    assert "Max-Age=2592000" in cookie
    assert client.cookies.get("rentflow_access_token")


async def test_failed_logins_apply_escalating_locks(client, auth_headers):
    failure_count = 0
    for threshold, lock_minutes in ((5, 5), (10, 15), (20, 60)):
        if failure_count:
            await mongodb_module.login_attempts_collection.update_many(
                {}, {"$set": {"blocked_until": datetime.now(timezone.utc) - timedelta(seconds=1)}}
            )
        while failure_count < threshold:
            r = await client.post(
                "/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}
            )
            assert r.status_code == 401
            failure_count += 1

        attempt = await mongodb_module.login_attempts_collection.find_one({"scope": "email"})
        blocked_until = attempt["blocked_until"]
        if blocked_until.tzinfo is None:
            blocked_until = blocked_until.replace(tzinfo=timezone.utc)
        remaining = (blocked_until - datetime.now(timezone.utc)).total_seconds()
        assert 0 < remaining <= lock_minutes * 60

        r = await client.post(
            "/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert r.status_code == 429
        assert "Retry-After" in r.headers


async def test_login_attempts_are_limited_by_ip_across_emails(client, auth_headers):
    for index in range(4):
        r = await client.post(
            "/api/auth/login",
            json={"email": f"missing{index}@example.com", "password": "wrong"},
        )
        assert r.status_code == 401

    r = await client.post(
        "/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    assert r.status_code == 200

    r = await client.post(
        "/api/auth/login",
        json={"email": "missing4@example.com", "password": "wrong"},
    )
    assert r.status_code == 401

    r = await client.post(
        "/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    assert r.status_code == 429


async def test_login_attempts_collection_has_ttl_index():
    await mongodb_module.ensure_indexes()
    indexes = await mongodb_module.login_attempts_collection.index_information()
    assert any(index.get("expireAfterSeconds") == 0 for index in indexes.values())


async def test_me_requires_auth(client):
    r = await client.get("/api/auth/me")
    assert r.status_code in (401, 403)


async def test_me_returns_profile(client, auth_headers):
    r = await client.get("/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


async def test_me_rejects_legacy_bearer_token(client, auth_headers):
    token = client.cookies.get("rentflow_access_token")
    client.cookies.clear()
    r = await client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 401


async def test_session_cookie_has_no_persistent_expiry(client, auth_headers):
    r = await client.post(
        "/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    assert r.status_code == 200
    assert "Max-Age=" not in r.headers["set-cookie"]


async def test_logout_clears_cookie(client, auth_headers):
    r = await client.post("/api/auth/logout")
    assert r.status_code == 204
    assert "Max-Age=0" in r.headers["set-cookie"]
    assert (await client.get("/api/auth/me")).status_code == 401


async def test_unsafe_request_rejects_untrusted_origin(client, auth_headers):
    r = await client.post("/api/auth/logout", headers={"Origin": "https://attacker.example"})
    assert r.status_code == 403


async def test_change_password_requires_correct_current_password(client, auth_headers):
    r = await client.put(
        "/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": "wrong", "new_password": "newpass123"},
    )
    assert r.status_code == 400


async def test_change_password_success_then_relogin(client, auth_headers):
    r = await client.put(
        "/api/auth/change-password",
        headers=auth_headers,
        json={"current_password": ADMIN_PASSWORD, "new_password": "newpass123"},
    )
    assert r.status_code == 200
    r = await client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": "newpass123"})
    assert r.status_code == 200


async def test_setup_status_true_when_no_users(client):
    r = await client.get("/api/auth/setup-status")
    assert r.status_code == 200
    assert r.json()["needs_setup"] is True


async def test_setup_status_false_once_a_user_exists(client, auth_headers):
    r = await client.get("/api/auth/setup-status")
    assert r.status_code == 200
    assert r.json()["needs_setup"] is False


async def test_register_creates_account_and_sets_cookie(client):
    r = await client.post(
        "/api/auth/register",
        json={"full_name": "Chu tro moi", "email": "owner@rentflow.app", "password": "SecurePass1"},
    )
    assert r.status_code == 201, r.text
    assert "access_token" not in r.json()
    assert "HttpOnly" in r.headers["set-cookie"]
    assert (await client.get("/api/auth/me")).status_code == 200

    r = await client.get("/api/auth/setup-status")
    assert r.json()["needs_setup"] is False


async def test_register_blocked_after_setup_complete(client, auth_headers):
    r = await client.post(
        "/api/auth/register",
        json={"full_name": "Ke gian", "email": "intruder@rentflow.app", "password": "SecurePass1"},
    )
    assert r.status_code == 403


async def test_second_register_attempt_always_blocked_by_setup_guard(client):
    await client.post(
        "/api/auth/register",
        json={"full_name": "A", "email": "dup@rentflow.app", "password": "SecurePass1"},
    )
    # Setup is now complete, so any further register call is rejected by the
    # setup guard (403) before it even reaches the duplicate-email check —
    # this is what guarantees RentFlow only ever has one landlord account.
    r = await client.post(
        "/api/auth/register",
        json={"full_name": "B", "email": "dup2@rentflow.app", "password": "SecurePass1"},
    )
    assert r.status_code == 403
