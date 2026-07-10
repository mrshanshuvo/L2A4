import { RentalOrderStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { CreateReviewPayload } from "./review.interface.js";

const createReviewInDB = async (payload: CreateReviewPayload, customerId: string) => {
  const { gearItemId, rating, comment } = payload;

  const gearExists = await prisma.gearItem.findUnique({
    where: { id: gearItemId },
  });

  if (!gearExists) {
    throw new Error("Gear item not found");
  }

  // Business logic: only users who have rented this gear item and had it returned can leave reviews
  const rentalExists = await prisma.rentalOrder.findFirst({
    where: {
      customerId,
      gearItemId,
      status: RentalOrderStatus.RETURNED,
    },
  });

  if (!rentalExists) {
    throw new Error(
      "You can only review gear items that you have rented and returned",
    );
  }

  // Create the review
  const result = await prisma.review.create({
    data: {
      customerId,
      gearItemId,
      rating,
      comment,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          profile_image: true,
        },
      },
    },
  });

  return result;
};

export const ReviewService = {
  createReviewInDB,
};
