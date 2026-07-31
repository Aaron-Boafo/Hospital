import { ServerError } from "@/shared/errors/index.js";
import { asyncHandler } from "@/shared/utils/index.js";
import { userService } from "./user.service.js";
import { loginSchema } from "./user.validation.js";

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.parse(req.body);
  const result = await userService.loginWithFirebase(parsed);
  res.json(result);
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw new ServerError("Unauthorized", 401);
  res.json({ user: userService.toUserDto(req.user) });
});
