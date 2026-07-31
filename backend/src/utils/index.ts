import { type Server } from "node:http";
import { type Pool } from "pg";
import { logger } from "../config/logger.config.js";

const GRACE_PERIOD_MS = 10_000;

export class ServerError extends Error {
  public readonly status: number;
  public readonly data: Record<string, unknown>;
  public readonly isDev: boolean;

  constructor(
    message: string,
    status: number,
    data: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ServerError";
    this.status = status;
    this.data = data;
    this.isDev = process.env.NODE_ENV === "development";
  }
}

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
