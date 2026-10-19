from contextlib import asynccontextmanager
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import (
    audit,
    auth,
    bills,
    dashboard,
    issues,
    meters,
    payments,
    portal,
    pricing,
    rooms,
    tenants,
    users,
)
from app.core.config import settings
from app.db.mongodb import audit_logs_collection, ensure_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_indexes()
    yield


app = FastAPI(
    title="RentFlow API",
    description="He thong quan ly phong tro - API backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("rentflow.audit")


@app.middleware("http")
async def validate_request_origin(request: Request, call_next):
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        origin = request.headers.get("origin")
        same_origin = f"{request.url.scheme}://{request.url.netloc}"
        trusted_origins = {*settings.cors_origin_list, same_origin}
        if origin and origin not in trusted_origins:
            return JSONResponse(
                status_code=403, content={"detail": "Origin không hợp lệ"}
            )
    return await call_next(request)


@app.middleware("http")
async def audit_mutations(request: Request, call_next):
    response = await call_next(request)
    actor = getattr(request.state, "current_user", None)
    if actor and request.method in {"POST", "PUT", "PATCH", "DELETE"} and response.status_code < 400:
        try:
            await audit_logs_collection.insert_one(
                {
                    "actor_id": str(actor.id),
                    "actor_name": actor.full_name,
                    "actor_email": actor.email,
                    "actor_role": actor.role,
                    "action": f"{request.method} {request.url.path}",
                    "resource": request.url.path,
                    "ip_address": request.client.host if request.client else None,
                    "created_at": datetime.now(timezone.utc),
                }
            )
        except Exception:
            logger.exception("Failed to write audit event")
    return response

app.include_router(auth.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(tenants.router, prefix="/api")
app.include_router(meters.router, prefix="/api")
app.include_router(pricing.router, prefix="/api")
app.include_router(bills.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(issues.router, prefix="/api")
app.include_router(portal.router, prefix="/api")


@app.get("/api/health", tags=["health"])
async def health():
    return {"status": "ok"}
