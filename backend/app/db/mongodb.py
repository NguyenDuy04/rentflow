import logging

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

logger = logging.getLogger("rentflow")

client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=5000)
db = client[settings.mongodb_db_name]

users_collection = db["users"]
rooms_collection = db["rooms"]
tenants_collection = db["tenants"]
meters_collection = db["meter_readings"]
pricing_collection = db["pricing_config"]
bills_collection = db["bills"]
payments_collection = db["payments"]
bank_account_settings_collection = db["bank_account_settings"]
audit_logs_collection = db["audit_logs"]
issues_collection = db["maintenance_issues"]
login_attempts_collection = db["login_attempts"]


async def ensure_indexes() -> None:
    """Create indexes needed for uniqueness/lookups. Non-fatal if the DB is
    unreachable at startup (e.g. local dev before MongoDB is configured) so the
    API can still boot and serve /api/health and /docs."""
    try:
        await users_collection.create_index("email", unique=True)
        await rooms_collection.create_index("room_code", unique=True)
        await tenants_collection.create_index("room_id")
        await tenants_collection.create_index("status")
        await meters_collection.create_index([("room_id", 1), ("month", 1)], unique=True)
        await bills_collection.create_index([("room_id", 1), ("month", 1)])
        await bills_collection.create_index("bill_code", unique=True)
        await bills_collection.create_index("status")
        await payments_collection.create_index("bill_id")
        await audit_logs_collection.create_index([("created_at", -1)])
        await audit_logs_collection.create_index([("actor_id", 1), ("created_at", -1)])
        await issues_collection.create_index([("tenant_id", 1), ("created_at", -1)])
        await issues_collection.create_index([("status", 1), ("created_at", -1)])
        await login_attempts_collection.create_index("expires_at", expireAfterSeconds=0)
        logger.info("MongoDB indexes ensured.")
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Could not connect to MongoDB to create indexes (%s). "
            "Check MONGODB_URI in your .env file. The API will still start.",
            exc,
        )
