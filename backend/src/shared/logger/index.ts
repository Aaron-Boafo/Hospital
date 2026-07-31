import winston from "winston";
import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";
const level = (
  process.env.LOG_LEVEL || (isProduction ? "info" : "debug")
).toLowerCase();
const logDir = process.env.LOG_DIR || "logs";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const baseFormat = combine(errors({ stack: true }), timestamp());

const consoleFormat = isProduction
  ? combine(baseFormat, json())
  : combine(
      baseFormat,
      colorize(),
      printf(({ timestamp, level, message, stack, ...meta }) => {
        const metaStr = Object.keys(meta).length
          ? ` ${JSON.stringify(meta)}`
          : "";
        const stackStr = stack ? `\n${stack}` : "";
        return `${timestamp} [${level}]: ${message}${metaStr}${stackStr}`;
      }),
    );

const fileFormat = combine(baseFormat, json());

const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

const errorFileTransport = new winston.transports.File({
  dirname: logDir,
  filename: "error.log",
  level: "error",
  format: fileFormat,
  maxsize: 10 * 1024 * 1024,
  maxFiles: 5,
});

const combinedFileTransport = new winston.transports.File({
  dirname: logDir,
  filename: "combined.log",
  format: fileFormat,
  maxsize: 10 * 1024 * 1024,
  maxFiles: 5,
});

const exceptionFileTransport = new winston.transports.File({
  dirname: logDir,
  filename: "exceptions.log",
  format: fileFormat,
  maxsize: 10 * 1024 * 1024,
  maxFiles: 5,
});

export const logger = winston.createLogger({
  level,
  format: fileFormat,
  defaultMeta: { service: "hms-backend" },
  transports: [consoleTransport, errorFileTransport, combinedFileTransport],
  exceptionHandlers: [consoleTransport, exceptionFileTransport],
  rejectionHandlers: [consoleTransport, exceptionFileTransport],
});
