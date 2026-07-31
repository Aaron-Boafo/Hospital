import type { RequestHandler } from "express";
import { eq } from "drizzle-orm";
import { jwtConfig } from "../config/jwt.config.js";
import { AUTH_COOKIE_NAME } from "../config/cookie.config.js";
import { db } from "../database/db.js";
import { users } from "../database/schema/schema.js";
import type { User } from "../database/schema/types.js";
import { ServerError } from "../errors/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const header = req.header("authorization");
    const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;
    const token = cookieToken ?? bearerToken;
    if (!token) throw new ServerError("Authentication token is missing", 401);

    let sub: string;
    try {
      const payload = jwtConfig.verify(token);
      sub = String(payload.sub ?? "");
    } catch {
      throw new ServerError("Invalid or expired session token", 401);
    }
    if (!sub) throw new ServerError("Session token is missing a subject", 401);

    const user = (
      await db.select().from(users).where(eq(users.id, sub)).limit(1)
    )[0];
    if (!user) throw new ServerError("User no longer exists", 401);
    if (!user.active) throw new ServerError("Account is disabled", 403);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export function requireRole(...roles: User["role"][]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new ServerError("Unauthorized", 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ServerError("Forbidden: insufficient permissions", 403));
      return;
    }
    next();
  };
}
