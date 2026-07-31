import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth.js";
import { login, logout, me } from "./user.controller.js";

const userRouter = Router();

userRouter.post("/auth/login", login);
userRouter.post("/auth/logout", logout);
userRouter.get("/auth/me", authenticate, me);

export { userRouter };
