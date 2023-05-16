import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

export const envSchema = z.object({
  DB_PATH: z.string(),
  BOT_ROOT_DIR: z.string(),
  DC_TOKEN: z.string(),
  DC_CLIENT_ID: z.string(),
  DC_GUILD_ID: z.string(),
  NODE_ENV: z.enum(["development", "production"]),
  DC_FRESH_ROLE_ID: z.string(),
  DC_MANAGER_ROLE_ID: z.string(),
  DC_REASON_MAX_LENGTH: z.coerce.number(),
});

export default envSchema.parse(process.env);
