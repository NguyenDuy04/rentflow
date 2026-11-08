from datetime import datetime, timezone

import pytest
from bson import ObjectId

import app.db.mongodb as mongodb_module

pytestmark = pytest.mark.asyncio


async def _create_staff(client, owner_headers, email="staff@rentflow.app"):
    response = await client.post(
        "/api/users/staff",
        headers=owner_headers,
        json={
            "email": email,
            "full_name": "Staff One",
            "phone": "0900000001",
            "password": "StaffPass123",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


async def _login_as(client, email, password):
    client.cookies.clear()
    response = await client.post(
        "/api/auth/login", json={"email": email, "password": password}
    )
    assert response.status_code == 200, response.text


async def _create_tenant(client, owner_headers, email, room_id):
    response = await client.post(
        "/api/tenants",
        headers=owner_headers,
        json={
            "full_name": email.split("@")[0],
            "phone": "0900000002",
            "email": email,
            "national_id": "012345678901",
            "room_id": room_id,
            "lease_start_date": "2026-01-01",
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


async def _create_tenant_account(client, owner_headers, tenant_id, email):
    response = await client.post(
        "/api/users/tenant-accounts",
        headers=owner_headers,
        json={"tenant_id": tenant_id, "password": "TenantPass123"},
    )
    assert response.status_code == 201, response.text
    assert response.json()["email"] == email


async def test_owner_can_create_and_delete_staff_and_audit_actions(client, auth_headers):
    staff = await _create_staff(client, auth_headers)
    assert staff["role"] == "staff"

    logs = await client.get("/api/audit-logs", headers=auth_headers)
    assert logs.status_code == 200
    assert any(
        log["actor_role"] == "owner" and log["resource"] == "/api/users/staff"
        for log in logs.json()["items"]
    )

    deleted = await client.delete(f"/api/users/staff/{staff['id']}", headers=auth_headers)
    assert deleted.status_code == 204
    assert await mongodb_module.users_collection.find_one({"_id": ObjectId(staff["id"])}) is None


async def test_staff_can_change_room_status_but_not_manage_room_or_staff(client, auth_headers):
    room_response = await client.post(
        "/api/rooms", headers=auth_headers,
        json={"room_code": "A101", "name": "Room 101", "rent_price": 1_000_000},
    )
    room_id = room_response.json()["id"]
    await _create_staff(client, auth_headers)
    await _login_as(client, "staff@rentflow.app", "StaffPass123")

    status_update = await client.patch(
        f"/api/rooms/{room_id}/status", json={"status": "maintenance"}
    )
    assert status_update.status_code == 200
    assert status_update.json()["status"] == "maintenance"

    room_edit = await client.put(
        f"/api/rooms/{room_id}", json={"rent_price": 9_999_999}
    )
    assert room_edit.status_code == 403
    staff_create = await client.post(
        "/api/users/staff",
        json={"email": "another@rentflow.app", "full_name": "Other", "password": "LongPassword1"},
    )
    assert staff_create.status_code == 403

    logs = await client.get("/api/audit-logs")
    assert logs.status_code == 200
    assert any(log["actor_role"] == "staff" and "PATCH /api/rooms/" in log["action"] for log in logs.json()["items"])


async def test_tenant_portal_is_scoped_and_can_report_issue_and_get_own_qr(client, auth_headers):
    room_one = await client.post(
        "/api/rooms", headers=auth_headers,
        json={"room_code": "A101", "name": "Room 101", "rent_price": 1_000_000},
    )
    room_two = await client.post(
        "/api/rooms", headers=auth_headers,
        json={"room_code": "A102", "name": "Room 102", "rent_price": 1_000_000},
    )
    tenant_one = await _create_tenant(client, auth_headers, "tenant1@rentflow.app", room_one.json()["id"])
    tenant_two = await _create_tenant(client, auth_headers, "tenant2@rentflow.app", room_two.json()["id"])
    await _create_tenant_account(client, auth_headers, tenant_one["id"], "tenant1@rentflow.app")
    await _create_tenant_account(client, auth_headers, tenant_two["id"], "tenant2@rentflow.app")

    own_bill_id = ObjectId()
    other_bill_id = ObjectId()
    now = datetime.now(timezone.utc)
    base_bill = {
        "bill_code": "HD2026100001",
        "month": "2026-10",
        "room_id": room_one.json()["id"],
        "room_rent": 1_000_000,
        "electricity_consumption": 0,
        "electricity_amount": 0,
        "water_consumption": 0,
        "water_amount": 0,
        "internet_fee": 0,
        "parking_fee": 0,
        "cleaning_fee": 0,
        "other_fee": 0,
        "total_amount": 1_000_000,
        "status": "unpaid",
        "due_date": now,
        "created_at": now,
    }
    await mongodb_module.bills_collection.insert_one(
        {**base_bill, "_id": own_bill_id, "tenant_id": tenant_one["id"]}
    )
    await mongodb_module.bills_collection.insert_one(
        {
            **base_bill,
            "_id": other_bill_id,
            "bill_code": "HD2026100002",
            "room_id": room_two.json()["id"],
            "tenant_id": tenant_two["id"],
        }
    )
    await mongodb_module.bank_account_settings_collection.insert_one(
        {
            "_id": "primary",
            "bank_bin": "970436",
            "bank_name": "Vietcombank",
            "account_number": "1234567890",
            "account_name": "OWNER",
        }
    )

    await _login_as(client, "tenant1@rentflow.app", "TenantPass123")
    overview = await client.get("/api/portal/overview")
    assert overview.status_code == 200, overview.text
    assert overview.json()["tenant"]["id"] == tenant_one["id"]
    assert [bill["id"] for bill in overview.json()["bills"]] == [str(own_bill_id)]

    issue = await client.post(
        "/api/issues",
        json={"title": "Rò nước", "description": "Vòi bếp bị rò nước liên tục", "category": "plumbing"},
    )
    assert issue.status_code == 201, issue.text
    assert issue.json()["tenant_id"] == tenant_one["id"]
    assert [item["id"] for item in (await client.get("/api/issues")).json()] == [issue.json()["id"]]

    own_qr = await client.get(f"/api/bills/{own_bill_id}/vietqr")
    other_qr = await client.get(f"/api/bills/{other_bill_id}/vietqr")
    assert own_qr.status_code == 200
    assert other_qr.status_code == 404
    assert (await client.get("/api/tenants")).status_code == 403
    assert (await client.get("/api/payments")).status_code == 403
    assert (await client.post("/api/payments", json={"bill_id": str(own_bill_id), "amount": 1_000_000, "method": "bank_transfer"})).status_code == 403