from enum import Enum


class Permission(str, Enum):
    DASHBOARD_READ = "dashboard.read"
    ROOMS_READ = "rooms.read"
    ROOMS_CREATE = "rooms.create"
    ROOMS_UPDATE = "rooms.update"
    ROOMS_STATUS_UPDATE = "rooms.status.update"
    ROOMS_DELETE = "rooms.delete"
    TENANTS_READ = "tenants.read"
    TENANTS_CREATE = "tenants.create"
    TENANTS_UPDATE = "tenants.update"
    TENANTS_DELETE = "tenants.delete"
    METERS_READ = "meters.read"
    METERS_WRITE = "meters.write"
    BILLS_READ = "bills.read"
    BILLS_CREATE = "bills.create"
    BILLS_UPDATE = "bills.update"
    PAYMENTS_READ = "payments.read"
    PAYMENTS_CREATE = "payments.create"
    PAYMENTS_QR = "payments.qr"
    PRICING_READ = "pricing.read"
    PRICING_UPDATE = "pricing.update"
    AUDIT_READ = "audit.read"
    STAFF_MANAGE = "staff.manage"
    TENANT_ACCOUNTS_MANAGE = "tenant_accounts.manage"
    ISSUES_READ = "issues.read"
    ISSUES_UPDATE = "issues.update"
    PORTAL_READ = "portal.read"
    ISSUES_CREATE = "issues.create"


OWNER_PERMISSIONS = frozenset(Permission)

STAFF_PERMISSIONS = frozenset(
    {
        Permission.DASHBOARD_READ,
        Permission.ROOMS_READ,
        Permission.ROOMS_STATUS_UPDATE,
        Permission.TENANTS_READ,
        Permission.TENANTS_CREATE,
        Permission.TENANTS_DELETE,
        Permission.BILLS_READ,
        Permission.PAYMENTS_READ,
        Permission.PAYMENTS_CREATE,
        Permission.PAYMENTS_QR,
        Permission.AUDIT_READ,
        Permission.TENANT_ACCOUNTS_MANAGE,
        Permission.ISSUES_READ,
        Permission.ISSUES_UPDATE,
    }
)

TENANT_PERMISSIONS = frozenset(
    {
        Permission.PORTAL_READ,
        Permission.PAYMENTS_QR,
        Permission.ISSUES_CREATE,
    }
)

ROLE_PERMISSIONS = {
    "owner": OWNER_PERMISSIONS,
    "staff": STAFF_PERMISSIONS,
    "tenant": TENANT_PERMISSIONS,
}


def has_permission(role: str, permission: Permission) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, frozenset())