import pytest

pytestmark = pytest.mark.asyncio


async def _create_room(client, headers, room_code="P101"):
    r = await client.post(
        "/api/rooms",
        headers=headers,
        json={
            "room_code": room_code,
            "name": f"Phong {room_code}",
            "floor": "1",
            "area": 20,
            "rent_price": 2_500_000,
            "deposit_required": 2_500_000,
            "max_occupants": 2,
        },
    )
    assert r.status_code == 201, r.text
    return r.json()


async def test_create_room(client, auth_headers):
    room = await _create_room(client, auth_headers)
    assert room["status"] == "available"
    assert len(room["id"]) == 24


async def test_duplicate_room_code_rejected(client, auth_headers):
    await _create_room(client, auth_headers)
    r = await client.post(
        "/api/rooms", headers=auth_headers, json={"room_code": "P101", "name": "dup", "rent_price": 1}
    )
    assert r.status_code == 400


async def test_room_search(client, auth_headers):
    await _create_room(client, auth_headers, "P101")
    await _create_room(client, auth_headers, "P202")
    r = await client.get("/api/rooms?search=P202", headers=auth_headers)
    assert r.status_code == 200
    assert [x["room_code"] for x in r.json()] == ["P202"]


async def test_tenant_assignment_flips_room_to_occupied(client, auth_headers):
    room = await _create_room(client, auth_headers)
    r = await client.post(
        "/api/tenants",
        headers=auth_headers,
        json={
            "full_name": "Nguyen Van A",
            "phone": "0900000000",
            "national_id": "012345678900",
            "room_id": room["id"],
            "lease_start_date": "2026-01-01",
            "deposit_amount": 2_500_000,
        },
    )
    assert r.status_code == 201, r.text

    r = await client.get(f"/api/rooms/{room['id']}", headers=auth_headers)
    assert r.json()["status"] == "occupied"


async def test_cannot_delete_room_with_active_tenant(client, auth_headers):
    room = await _create_room(client, auth_headers)
    await client.post(
        "/api/tenants",
        headers=auth_headers,
        json={
            "full_name": "Nguyen Van A",
            "phone": "0900000000",
            "national_id": "012345678900",
            "room_id": room["id"],
            "lease_start_date": "2026-01-01",
        },
    )
    r = await client.delete(f"/api/rooms/{room['id']}", headers=auth_headers)
    assert r.status_code == 400


async def test_transfer_room_frees_old_room_and_occupies_new(client, auth_headers):
    room_a = await _create_room(client, auth_headers, "P101")
    room_b = await _create_room(client, auth_headers, "P202")
    r = await client.post(
        "/api/tenants",
        headers=auth_headers,
        json={
            "full_name": "Nguyen Van A",
            "phone": "0900000000",
            "national_id": "012345678900",
            "room_id": room_a["id"],
            "lease_start_date": "2026-01-01",
        },
    )
    tenant = r.json()

    r = await client.post(
        f"/api/tenants/{tenant['id']}/transfer-room",
        headers=auth_headers,
        json={"new_room_id": room_b["id"]},
    )
    assert r.status_code == 200
    assert r.json()["room_id"] == room_b["id"]

    r = await client.get(f"/api/rooms/{room_a['id']}", headers=auth_headers)
    assert r.json()["status"] == "available"
    r = await client.get(f"/api/rooms/{room_b['id']}", headers=auth_headers)
    assert r.json()["status"] == "occupied"


async def test_end_contract_frees_room(client, auth_headers):
    room = await _create_room(client, auth_headers)
    r = await client.post(
        "/api/tenants",
        headers=auth_headers,
        json={
            "full_name": "Nguyen Van A",
            "phone": "0900000000",
            "national_id": "012345678900",
            "room_id": room["id"],
            "lease_start_date": "2026-01-01",
        },
    )
    tenant = r.json()

    r = await client.post(f"/api/tenants/{tenant['id']}/end-contract", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["status"] == "ended"

    r = await client.get(f"/api/rooms/{room['id']}", headers=auth_headers)
    assert r.json()["status"] == "available"
