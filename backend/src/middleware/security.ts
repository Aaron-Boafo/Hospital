import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import { logger } from "../config/logger.config.js";

const allowedOrigins =
  process.env.CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? ["http://localhost:5173"];

export const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

export const corsMiddleware = cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
  exposedHeaders: ["x-request-id"],
  credentials: true,
  maxAge: 86400,
});

export const requestId: RequestHandler = (req, res, next) => {
  const id = req.header("x-request-id") || randomUUID();
  res.setHeader("x-request-id", id);
  res.locals.requestId = id;
  next();
};

export const requestLogger: RequestHandler = (req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    const requestId = res.locals.requestId as string | undefined;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      requestId,
    };
    if (res.statusCode >= 500) {
      logger.error("Request failed", meta);
    } else if (res.statusCode >= 400) {
      logger.warn("Request warning", meta);
    } else {
      logger.info("Request completed", meta);
    }
  });
  next();
};

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
  message: { message: "Too many requests, please try again later" },
});
