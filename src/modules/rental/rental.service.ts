import { RentalOrderStatus, Role } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { CreateRentalOrderPayload } from "./rental.interface.js";

const createRentalOrderInDB = async (
  payload: CreateRentalOrderPayload,
  customerId: string,
) => {
  const { gearItemId, startDate, endDate } = payload;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid start or end date format");
  }

  if (end <= start) {
    throw new Error("End date must be after start date");
  }

  // Calculate rental duration in days
  const timeDifference = end.getTime() - start.getTime();
  let days = Math.ceil(timeDifference / (1000 * 3600 * 24));
  if (days < 1) days = 1;

  const result = await prisma.$transaction(async (tx) => {
    const gear = await tx.gearItem.findUnique({
      where: { id: gearItemId },
    });

    if (!gear) {
      throw new Error("Gear item not found");
    }

    if (gear.stock <= 0) {
      throw new Error("Gear item is currently out of stock");
    }

    const totalCost = gear.pricePerDay * days;

    // Decrement stock
    await tx.gearItem.update({
      where: { id: gearItemId },
      data: {
        stock: {
          decrement: 1,
        },
      },
    });

    const rentalOrder = await tx.rentalOrder.create({
      data: {
        customerId,
        gearItemId,
        startDate: start,
        endDate: end,
        totalCost,
        status: RentalOrderStatus.PLACED,
      },
      include: {
        gearItem: true,
      },
    });

    return rentalOrder;
  });

  return result;
};

const getCustomerRentalsFromDB = async (customerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: { customerId },
    include: {
      gearItem: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const getRentalByIdFromDB = async (
  id: string,
  userId: string,
  userRole: Role,
) => {
  const rental = await prisma.rentalOrder.findUnique({
    where: { id },
    include: {
      gearItem: {
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payments: true,
    },
  });

  if (!rental) {
    throw new Error("Rental order not found");
  }

  // Authorization check
  if (userRole === Role.Customer && rental.customerId !== userId) {
    throw new Error("You are not authorized to view this rental order");
  }

  if (userRole === Role.Provider && rental.gearItem.providerId !== userId) {
    throw new Error("You are not authorized to view this rental order");
  }

  return rental;
};

const getProviderOrdersFromDB = async (providerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: {
      gearItem: {
        providerId,
      },
    },
    include: {
      gearItem: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

const updateRentalOrderStatusInDB = async (
  id: string,
  status: RentalOrderStatus,
  userId: string,
  userRole: Role,
) => {
  const rental = await prisma.rentalOrder.findUnique({
    where: { id },
    include: {
      gearItem: true,
    },
  });

  if (!rental) {
    throw new Error("Rental order not found");
  }

  // Customer permissions: Can only CANCEL a PLACED order
  if (userRole === Role.Customer) {
    if (rental.customerId !== userId) {
      throw new Error("You are not authorized to update this rental order");
    }
    if (status !== RentalOrderStatus.CANCELLED) {
      throw new Error("Customers are only allowed to cancel their rentals");
    }
    if (rental.status !== RentalOrderStatus.PLACED) {
      throw new Error("Order can only be cancelled if it is in PLACED status");
    }
  }

  // Provider permissions: Can confirm, check out, and return gear
  if (userRole === Role.Provider) {
    if (rental.gearItem.providerId !== userId) {
      throw new Error("You are not authorized to update this rental order");
    }
    const allowedStatuses: RentalOrderStatus[] = [
      RentalOrderStatus.CONFIRMED,
      RentalOrderStatus.PICKED_UP,
      RentalOrderStatus.RETURNED,
    ];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Providers cannot change status to ${status}`);
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    // If transitioning to CANCELLED or RETURNED, increment stock back
    if (status === RentalOrderStatus.CANCELLED || status === RentalOrderStatus.RETURNED) {
      // Avoid double restocking if already returned/cancelled
      if (
        rental.status !== RentalOrderStatus.CANCELLED &&
        rental.status !== RentalOrderStatus.RETURNED
      ) {
        await tx.gearItem.update({
          where: { id: rental.gearItemId },
          data: {
            stock: {
              increment: 1,
            },
          },
        });
      }
    }

    const updatedOrder = await tx.rentalOrder.update({
      where: { id },
      data: { status },
      include: {
        gearItem: true,
      },
    });

    return updatedOrder;
  });

  return result;
};

const getAllRentalsForAdminFromDB = async () => {
  const result = await prisma.rentalOrder.findMany({
    include: {
      gearItem: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
};

export const RentalService = {
  createRentalOrderInDB,
  getCustomerRentalsFromDB,
  getRentalByIdFromDB,
  getProviderOrdersFromDB,
  updateRentalOrderStatusInDB,
  getAllRentalsForAdminFromDB,
};
