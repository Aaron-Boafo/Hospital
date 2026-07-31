import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./db.js";

await migrate(db, { migrationsFolder: "./src/shared/database/drizzle" });
await pool.end();

console.log("Migrations applied successfully");
