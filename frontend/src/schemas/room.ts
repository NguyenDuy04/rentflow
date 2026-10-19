import { z } from "zod";

export const createRoomSchema = (messages: {
  requiredRoomCode: string;
  requiredRoomName: string;
  invalidRentPrice: string;
  minimumOccupants: string;
}) =>
  z.object({
    room_code: z.string().min(1, messages.requiredRoomCode),
    name: z.string().min(1, messages.requiredRoomName),
    floor: z.string().optional().or(z.literal("")),
    area: z.coerce.number().min(0).optional(),
    rent_price: z.coerce.number().min(0, messages.invalidRentPrice),
    deposit_required: z.coerce.number().min(0).default(0),
    max_occupants: z.coerce.number().int().min(1, messages.minimumOccupants),
    status: z
      .enum(["available", "occupied", "maintenance"])
      .default("available"),
    note: z.string().optional().or(z.literal("")),
  });
export type RoomFormInput = z.input<ReturnType<typeof createRoomSchema>>;
export type RoomInput = z.output<ReturnType<typeof createRoomSchema>>;
