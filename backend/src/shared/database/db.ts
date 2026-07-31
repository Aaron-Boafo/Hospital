import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { relations } from "./schema/schema.js";
import { DataSource } from "typeorm";
import { SqlDatabase } from "@langchain/classic/sql_db";

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

const datasource = new DataSource({
  type: "postgres",
  url: DB_STRING,
  entities: ["./src/modules/**/*.entity.ts"],
  synchronize: true,
});

await datasource.initialize();

const agent_db = await SqlDatabase.fromDataSourceParams({
  appDataSource: datasource,
});

export { pool, db, agent_db };
