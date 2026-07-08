import bcrypt from "bcryptjs";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma";
import { RegisterUserPayload, UpdateMyProfilePayload } from "./user.interface";
import { ActiveStatus } from "../../../generated/prisma/enums";

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
    omit: {
      password: true,
    },
  });

  return user;
};

const getMyProfileFromDB = async (id: string) => {
  const profile = await prisma.user.findUnique({
    where: { id },
    omit: { password: true },
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
    omit: { password: true },
  });

  return updatedUser;
};

const getAllUsersFromDB = async () => {
  const result = await prisma.user.findMany({
    omit: { password: true },
  });
  return result;
};

const updateUserStatusInDB = async (id: string, active_status: ActiveStatus) => {
  const userExists = await prisma.user.findUnique({
    where: { id },
  });

  if (!userExists) {
    throw new Error("User not found");
  }

  const result = await prisma.user.update({
    where: { id },
    data: { active_status },
    omit: { password: true },
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
