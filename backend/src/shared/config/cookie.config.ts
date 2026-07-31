import type { CookieOptions } from "express";

export const AUTH_COOKIE_NAME = "hms_token";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/api",
};
