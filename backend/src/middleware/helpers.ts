import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../config/logger.config.js";
import { ServerError } from "../utils/index.js";

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = res.locals.requestId as string | undefined;

  if (err instanceof ServerError) {
    logger.warn("ServerError", {
      message: err.message,
      status: err.status,
      requestId,
    });
    res.status(err.status).json({
      message: err.message,
      ...(err.data && { data: err.data }),
    });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    logger.warn("Malformed JSON", { requestId });
    res.status(400).json({ message: "Invalid JSON payload" });
    return;
  }

  logger.error("Unhandled error", {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    method: req.method,
    url: req.originalUrl,
    requestId,
  });
  res.status(500).json({
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      error: err instanceof Error ? err.message : String(err),
    }),
  });
};
