"""Create the first landlord (chu tro) account.

Usage:
    cd backend
    python scripts/seed.py

Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME from the
environment (or .env), falling back to sensible defaults for local dev.
"""
import asyncio
import os
import sys
from datetime import datetime, timezone

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv  # noqa: E402

load_dotenv()

from app.core.security import hash_password  # noqa: E402
from app.db.mongodb import users_collection  # noqa: E402


async def main() -> None:
    email = os.getenv("SEED_ADMIN_EMAIL", "admin@rentflow.app")
    password = os.getenv("SEED_ADMIN_PASSWORD", "ChangeMe123!")
    full_name = os.getenv("SEED_ADMIN_NAME", "Chu tro")

    existing = await users_collection.find_one({"email": email})
    if existing:
        print(f"Tai khoan {email} da ton tai. Bo qua.")
        return

    await users_collection.insert_one(
        {
            "email": email,
            "full_name": full_name,
            "phone": None,
            "hashed_password": hash_password(password),
            "created_at": datetime.now(timezone.utc),
        }
    )
    print(f"Da tao tai khoan chu tro: {email} / {password}")
    print("Hay dang nhap va doi mat khau ngay.")


if __name__ == "__main__":
    asyncio.run(main())
