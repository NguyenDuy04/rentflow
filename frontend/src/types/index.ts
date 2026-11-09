export type RoomStatus = "available" | "occupied" | "maintenance";
export type TenantStatus = "active" | "ended";
export type BillStatus = "unpaid" | "paid";
export type PaymentMethod = "cash" | "bank_transfer";
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

export interface Room {
  id: string;
  room_code: string;
  name: string;
  floor: string | null;
  area: number | null;
  rent_price: number;
  deposit_required: number;
  max_occupants: number;
  status: RoomStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}
