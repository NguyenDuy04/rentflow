"""Pytest fixtures.

Routes import their MongoDB collections directly at module level
(`from app.db.mongodb import rooms_collection`) rather than through FastAPI's
dependency-injection system, which keeps the route code simple. The
trade-off is that tests must patch `app.db.mongodb`'s collection attributes
BEFORE `app.main` (and therefore every route module) is first imported, so
every route ends up bound to the same in-memory mock collections used here.
"""
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient

import app.db.mongodb as mongodb_module

_mock_client = AsyncMongoMockClient()
_mock_db = _mock_client["rentflow_test"]

mongodb_module.client = _mock_client
mongodb_module.db = _mock_db
mongodb_module.users_collection = _mock_db["users"]
mongodb_module.rooms_collection = _mock_db["rooms"]
mongodb_module.tenants_collection = _mock_db["tenants"]
mongodb_module.meters_collection = _mock_db["meter_readings"]
mongodb_module.pricing_collection = _mock_db["pricing_config"]
mongodb_module.bills_collection = _mock_db["bills"]
mongodb_module.payments_collection = _mock_db["payments"]
mongodb_module.bank_account_settings_collection = _mock_db["bank_account_settings"]
mongodb_module.audit_logs_collection = _mock_db["audit_logs"]
mongodb_module.issues_collection = _mock_db["maintenance_issues"]
mongodb_module.login_attempts_collection = _mock_db["login_attempts"]

from app.core.security import hash_password  # noqa: E402
from app.main import app  # noqa: E402

ALL_COLLECTIONS = [
    mongodb_module.users_collection,
    mongodb_module.rooms_collection,
    mongodb_module.tenants_collection,
    mongodb_module.meters_collection,
    mongodb_module.pricing_collection,
    mongodb_module.bills_collection,
    mongodb_module.payments_collection,
    mongodb_module.bank_account_settings_collection,
    mongodb_module.audit_logs_collection,
    mongodb_module.issues_collection,
    mongodb_module.login_attempts_collection,
]

ADMIN_EMAIL = "admin@rentflow.app"
ADMIN_PASSWORD = "ChangeMe123!"


@pytest_asyncio.fixture(autouse=True)
async def _clean_db():
    for collection in ALL_COLLECTIONS:
        await collection.delete_many({})
    yield


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture
async def auth_headers(client):
    from datetime import datetime, timezone

    await mongodb_module.users_collection.insert_one(
        {
            "email": ADMIN_EMAIL,
            "full_name": "Chu tro",
            "phone": None,
            "hashed_password": hash_password(ADMIN_PASSWORD),
            "created_at": datetime.now(timezone.utc),
        }
    )
    r = await client.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    return {}
