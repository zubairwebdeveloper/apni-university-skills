// lib/auth/roles.js
export { ROLE_LIST as ROLES, STAFF_ROLES } from "@/lib/constants/roles";
// lib/auth/authorize.js: for Part 2 server actions
import "server-only";
import { AppError } from "@/lib/errors";
import { getSessionUser } from "./session";

export async function assertRole(...roles) {
  const user = await getSessionUser();
  if (!user) throw new AppError("Please log in to continue.", 401);
  if (!roles.includes(user.role))
    throw new AppError("You don't have permission to do that.", 403);
  return user;
}

