import env from "../env";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";

const db = new Database(env.DB_PATH);

const drizzleDb = drizzle(db, {
  logger: env.NODE_ENV === "development",
});

migrate(drizzleDb, {
  migrationsFolder: path.join(env.BOT_ROOT_DIR, "migrations"),
});

export default drizzle(db);
