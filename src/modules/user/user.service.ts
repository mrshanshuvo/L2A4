import bcrypt from "bcryptjs";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import {
  RegisterUserPayload,
  UpdateMyProfilePayload,
} from "./user.interface.js";
import { ActiveStatus } from "@prisma/client";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, role, profile_image } = payload;

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      profile_image,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
      email: createdUser.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active_status: true,
      profile_image: true,
      bio: true,
      created_at: true,
      updated_at: true,
    },
  });

  return user;
};

const getMyProfileFromDB = async (id: string) => {
  const profile = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active_status: true,
      profile_image: true,
      bio: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!profile) {
    throw new Error("User not found");
  }

  return profile;
};

const updateMyProfileIntoDB = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateMyProfilePayload;
}) => {
  const { name, email, profile_image, bio } = payload;

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name,
      email,
      profile_image,
      bio,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active_status: true,
      profile_image: true,
      bio: true,
      created_at: true,
      updated_at: true,
    },
  });

  return updatedUser;
};

const getAllUsersFromDB = async () => {
  const total = await prisma.user.count();
  const result = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active_status: true,
      profile_image: true,
      bio: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: { created_at: "desc" },
  });
  return {
    meta: {
      page: 1,
      limit: total,
      total,
    },
    data: result,
  };
};

const updateUserStatusInDB = async (
  id: string,
  active_status: ActiveStatus,
) => {
  const userExists = await prisma.user.findUnique({
    where: { id },
  });

  if (!userExists) {
    throw new Error("User not found");
  }

  const result = await prisma.user.update({
    where: { id },
    data: { active_status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active_status: true,
      profile_image: true,
      bio: true,
      created_at: true,
      updated_at: true,
    },
  });

  return result;
};

export const UserService = {
  registerUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileIntoDB,
  getAllUsersFromDB,
  updateUserStatusInDB,
};
