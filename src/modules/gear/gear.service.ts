import { prisma } from "../../lib/prisma.js";
import { CreateGearPayload, UpdateGearPayload, GearQueryFilters } from "./gear.interface.js";

const createGearInDB = async (payload: CreateGearPayload, providerId: string) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!categoryExists) {
    throw new Error("Category not found");
  }

  const result = await prisma.gearItem.create({
    data: {
      ...payload,
      providerId,
    },
  });
  return result;
};

const getAllGearFromDB = async (filters: GearQueryFilters) => {
  const { searchTerm, category, brand, minPrice, maxPrice, availableOnly } = filters;

  const whereConditions: any = {};

  if (searchTerm) {
    whereConditions.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (category) {
    whereConditions.category = {
      name: { equals: category, mode: "insensitive" },
    };
  }

  if (brand) {
    whereConditions.brand = { equals: brand, mode: "insensitive" };
  }

  if (minPrice || maxPrice) {
    whereConditions.pricePerDay = {};
    if (minPrice) {
      whereConditions.pricePerDay.gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      whereConditions.pricePerDay.lte = parseFloat(maxPrice);
    }
  }

  if (availableOnly === "true") {
    whereConditions.stock = { gt: 0 };
  }

  const result = await prisma.gearItem.findMany({
    where: whereConditions,
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          profile_image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getGearByIdFromDB = async (id: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          profile_image: true,
        },
      },
      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              profile_image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!gear) {
    throw new Error("Gear item not found");
  }

  return gear;
};

const updateGearInDB = async (
  id: string,
  payload: UpdateGearPayload,
  providerId: string,
) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id },
  });

  if (!gear) {
    throw new Error("Gear item not found");
  }

  if (gear.providerId !== providerId) {
    throw new Error("You are not authorized to update this gear listing");
  }

  if (payload.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });
    if (!categoryExists) {
      throw new Error("Category not found");
    }
  }

  const result = await prisma.gearItem.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteGearFromDB = async (id: string, providerId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id },
  });

  if (!gear) {
    throw new Error("Gear item not found");
  }

  if (gear.providerId !== providerId) {
    throw new Error("You are not authorized to delete this gear listing");
  }

  const result = await prisma.gearItem.delete({
    where: { id },
  });

  return result;
};

const getAllGearForAdminFromDB = async () => {
  const result = await prisma.gearItem.findMany({
    include: {
      category: true,
      provider: {
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

export const GearService = {
  createGearInDB,
  getAllGearFromDB,
  getGearByIdFromDB,
  updateGearInDB,
  deleteGearFromDB,
  getAllGearForAdminFromDB,
};
