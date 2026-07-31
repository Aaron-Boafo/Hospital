import { type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { type Server } from "node:http";
import { type Pool } from "pg";
import { logger } from "../logger/index.js";

const GRACE_PERIOD_MS = 10_000;

export function gracefulShutdown(
  server: Server,
  pool: Pool,
  signal: string,
  exitCode = 0,
): void {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    logger.error("Graceful shutdown timed out, forcing exit");
    process.exit(1);
  }, GRACE_PERIOD_MS);
  forceExit.unref();

  server.close(async (error) => {
    clearTimeout(forceExit);
    if (error) {
      logger.error("Error while closing the server", {
        error: error.message,
      });
      exitCode = 1;
    }
    try {
      await pool.end();
      logger.info("Database pool closed");
    } catch (poolError) {
      logger.error("Error while closing the database pool", {
        error: poolError instanceof Error ? poolError.message : String(poolError),
      });
      exitCode = 1;
    }
    logger.info("Shutdown complete");
    process.exit(exitCode);
  });
  server.closeIdleConnections();
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

type DefinedKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export function omitUndefined<T extends object>(obj: T): Pick<T, DefinedKeys<T>> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Pick<T, DefinedKeys<T>>;
}
