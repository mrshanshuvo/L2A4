import { RentalOrderStatus } from "@prisma/client";

export interface CreateRentalOrderPayload {
  gearItemId: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
}

export interface UpdateRentalOrderStatusPayload {
  status: RentalOrderStatus;
}
