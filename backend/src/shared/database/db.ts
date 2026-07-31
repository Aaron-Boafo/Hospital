import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations } from "./schema/schema.js";

const DB_STRING =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DB
    : process.env.DATABASE_URL;

if (!DB_STRING) throw new Error("Database connection string not found");

const pool = new Pool({
  connectionString: DB_STRING,
});

const db = drizzle({
  client: pool,
  relations,
});

export { pool, db };
