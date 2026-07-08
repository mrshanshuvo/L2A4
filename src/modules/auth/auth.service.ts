import bcrypt from "bcryptjs";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { ILoginUser } from "./auth.interface";

const loginUser = async (payload: ILoginUser) => {
  const { email, password } = payload;

  const user = await prisma.user.findFirstOrThrow({
    where: { email },
  });

  if (user.active_status === "Inactive") {
    throw new Error(
      "Your account has been deactivated. Please contact the admin for assistance.",
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const tokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    tokenPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expiration } as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    tokenPayload,
    config.jwt_refresh_secret,
    { expiresIn: config.jwt_refresh_expiration } as SignOptions,
  );

  return { accessToken, refreshToken };
};

const refreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtUtils.verifiedToken(
    refreshToken,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success) {
    throw new Error(
      verifiedRefreshToken.success ? "" : verifiedRefreshToken.message,
    );
  }

  const { id } = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (user?.active_status === "Inactive") {
    throw new Error("User is Inactive");
  }

  const jwtPayload = {
    id,
    name: user?.name,
    email: user?.email,
    role: user?.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expiration } as SignOptions,
  );

  return { accessToken };
};

export const AuthService = {
  loginUser,
  refreshToken,
};
