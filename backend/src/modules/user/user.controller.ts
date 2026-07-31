import { ServerError } from "@/shared/errors/index.js";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
} from "@/shared/config/cookie.config.js";
import { asyncHandler } from "@/shared/utils/index.js";
import { userService } from "./user.service.js";
import { loginSchema } from "./user.validation.js";

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.parse(req.body);
  const { token, user } = await userService.loginWithFirebase(parsed);
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
  res.json({ user });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
  res.json({ success: true });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw new ServerError("Unauthorized", 401);
  res.json({ user: userService.toUserDto(req.user) });
});
