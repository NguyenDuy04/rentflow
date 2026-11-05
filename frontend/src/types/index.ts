export type UserRole = "owner" | "staff" | "tenant";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  tenant_id: string | null;
  created_at: string;
}
