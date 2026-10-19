import pytest
from urllib.parse import parse_qs, urlparse

pytestmark = pytest.mark.asyncio


async def _setup_room_with_tenant(client, headers):
    r = await client.post(
        "/api/rooms",
        headers=headers,
        json={"room_code": "P101", "name": "Phong 101", "rent_price": 2_500_000, "max_occupants": 2},
    )
    room = r.json()
    await client.post(
        "/api/tenants",
        headers=headers,
        json={
            "full_name": "Nguyen Van A",
            "phone": "0900000000",
            "national_id": "012345678900",
            "room_id": room["id"],
            "lease_start_date": "2026-01-01",
        },
    )
    await client.put(
        "/api/pricing",
        headers=headers,
        json={
            "electricity_price": 3500,
            "water_price": 20000,
            "internet_fee": 100000,
            "parking_fee": 50000,
            "cleaning_fee": 30000,
        },
    )
    return room


async def test_meter_reading_rejects_new_below_old(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    r = await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 100, "electricity_new": 90,
            "water_old": 10, "water_new": 18,
        },
    )
    assert r.status_code == 422


async def test_generate_bill_computes_correct_total(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 100, "electricity_new": 150,
            "water_old": 10, "water_new": 18,
        },
    )
    r = await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})
    assert r.status_code == 201, r.text
    bills = r.json()
    assert len(bills) == 1
    bill = bills[0]
    assert bill["electricity_consumption"] == 50
    assert bill["electricity_amount"] == 175_000
    assert bill["water_consumption"] == 8
    assert bill["water_amount"] == 160_000
    assert bill["total_amount"] == 3_015_000
    assert bill["status"] == "unpaid"


async def test_generate_bill_skips_room_without_meter_reading(client, auth_headers):
    await _setup_room_with_tenant(client, auth_headers)
    r = await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})
    assert r.status_code == 400


async def test_generate_bill_is_idempotent_per_room_month(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    r1 = await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})
    assert r1.status_code == 201
    r2 = await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})
    assert r2.status_code == 400  # nothing new to create, already exists


async def test_bill_pdf_export(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    bills = (await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})).json()
    r = await client.get(f"/api/bills/{bills[0]['id']}/pdf", headers=auth_headers)
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert len(r.content) > 1000


async def test_payment_marks_bill_paid_when_full_amount_covered(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    bill = (await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})).json()[0]

    r = await client.post(
        "/api/payments",
        headers=auth_headers,
        json={"bill_id": bill["id"], "amount": bill["total_amount"], "method": "cash"},
    )
    assert r.status_code == 201

    r = await client.get(f"/api/bills/{bill['id']}", headers=auth_headers)
    assert r.json()["status"] == "paid"


async def test_partial_payment_does_not_mark_bill_paid(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    bill = (await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})).json()[0]

    await client.post(
        "/api/payments",
        headers=auth_headers,
        json={"bill_id": bill["id"], "amount": bill["total_amount"] / 2, "method": "cash"},
    )
    r = await client.get(f"/api/bills/{bill['id']}", headers=auth_headers)
    assert r.json()["status"] == "unpaid"


async def test_vietqr_uses_remaining_balance_and_bill_code(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    bill = (await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})).json()[0]
    await client.put(
        "/api/payments/bank-account",
        headers=auth_headers,
        json={"bank_bin": "970436", "bank_name": "Vietcombank", "account_number": "1234567890", "account_name": "Chu Tro"},
    )
    await client.post(
        "/api/payments",
        headers=auth_headers,
        json={"bill_id": bill["id"], "amount": 735000, "method": "bank_transfer"},
    )

    response = await client.get(f"/api/bills/{bill['id']}/vietqr", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == bill["total_amount"] - 735000
    assert data["transfer_content"] == bill["bill_code"]
    assert data["bank_name"] == "Vietcombank"
    assert data["account_number"] == "1234567890"
    query = parse_qs(urlparse(data["qr_url"]).query)
    assert query["amount"] == [str(data["amount"])]
    assert query["addInfo"] == [bill["bill_code"]]


async def test_vietqr_requires_bank_account_settings(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    bill = (await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})).json()[0]

    response = await client.get(f"/api/bills/{bill['id']}/vietqr", headers=auth_headers)

    assert response.status_code == 400


async def test_bank_account_settings_can_start_empty_and_be_saved(client, auth_headers):
    response = await client.get("/api/payments/bank-account", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["bank_bin"] == ""

    response = await client.put(
        "/api/payments/bank-account",
        headers=auth_headers,
        json={"bank_bin": "970436", "bank_name": "Vietcombank", "account_number": "123456", "account_name": "  Chu Tro  "},
    )
    assert response.status_code == 200
    assert response.json()["bank_name"] == "Vietcombank"
    assert response.json()["account_name"] == "CHU TRO"

    invalid = await client.put(
        "/api/payments/bank-account",
        headers=auth_headers,
        json={"bank_bin": "bad", "account_number": "1", "account_name": "A"},
    )
    assert invalid.status_code == 422


async def test_dashboard_overview_reflects_state(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    bill = (await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})).json()[0]
    await client.post(
        "/api/payments",
        headers=auth_headers,
        json={"bill_id": bill["id"], "amount": bill["total_amount"], "method": "cash"},
    )

    r = await client.get("/api/dashboard/overview", headers=auth_headers)
    data = r.json()
    assert data["occupied_rooms"] == 1
    assert data["unpaid_bills_count"] == 0

    r = await client.get("/api/dashboard/revenue-chart?months=6", headers=auth_headers)
    assert len(r.json()) == 6
