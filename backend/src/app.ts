import express, { type Express } from "express";
import "dotenv/config";
import { logger } from "@/shared/logger/index.js";
import { pool } from "@/shared/database/db.js";
import { gracefulShutdown } from "@/shared/utils/index.js";
import {
  corsMiddleware,
  rateLimiter,
  requestId,
  requestLogger,
  securityHeaders,
} from "@/shared/middleware/security.js";
import { errorHandler, notFound } from "@/shared/middleware/helpers.js";
import { authenticate } from "@/shared/middleware/auth.js";
import { userRouter } from "@/modules/user/index.js";
import { activityRouter } from "@/modules/activity/index.js";
import { patientRouter } from "@/modules/patient/index.js";
import { doctorRouter } from "@/modules/doctor/index.js";
import { appointmentRouter } from "@/modules/appointment/index.js";
import { billingRouter } from "@/modules/billing/index.js";
import { medicineRouter } from "@/modules/medicine/index.js";
import { prescriptionRouter } from "@/modules/prescription/index.js";

const parsedPort = Number(process.env.PORT);
const PORT =
  Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535
    ? parsedPort
    : 3000;

const app: Express = express();

app.use(requestId);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json());
app.use(requestLogger);
app.use(rateLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(userRouter);

app.use(
  "/api",
  authenticate,
  activityRouter,
  patientRouter,
  doctorRouter,
  appointmentRouter,
  billingRouter,
  medicineRouter,
  prescriptionRouter,
);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server listening on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  logger.error("Server failed to start", { error: error.message, port: PORT });
  process.exit(1);
});

process.on("SIGINT", () => gracefulShutdown(server, pool, "SIGINT"));
process.on("SIGTERM", () => gracefulShutdown(server, pool, "SIGTERM"));

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", {
    error: error.message,
    stack: error.stack,
  });
  gracefulShutdown(server, pool, "uncaughtException", 1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", {
    error: reason instanceof Error ? reason.message : String(reason),
  });
  gracefulShutdown(server, pool, "unhandledRejection", 1);
});

export { app };
