import { Role } from "../../../generated/prisma/enums.js";

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  profile_image?: string;
}

export interface UpdateMyProfilePayload {
  name?: string;
  email?: string;
  profile_image?: string;
  bio?: string;
}
