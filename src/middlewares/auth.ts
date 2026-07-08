import { NextFunction, Request, Response } from "express";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";
import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        id: string;
        role: Role;
        name: string;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error(
        "You are not logged in. Please log in to access this route",
      );
    }

    const verifiedToken = jwtUtils.verifiedToken(
      token,
      config.jwt_access_secret,
    );

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.message);
    }

    const { email, name, id, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new Error("You are not authorized to access this route");
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.active_status === "Inactive") {
      throw new Error(
        "Your account has been deactivated. Please contact the admin for assistance.",
      );
    }

    req.user = {
      email,
      id,
      role,
      name,
    };

    next();
  });
};
