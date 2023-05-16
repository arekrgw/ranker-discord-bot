import { InferModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const ranking = sqliteTable("ranking", {
  id: integer("id").primaryKey(),
  rankedUserId: text("ranked_user_id").notNull(),
  rankingUserId: text("ranking_user_id").notNull(),
  reason: text("reason").notNull(),
  createdAt: integer("created_at").notNull(),
});

export type Ranking = InferModel<typeof ranking>; // return type when queried
export type InsertRanking = InferModel<typeof ranking, "insert">; // insert type

export default ranking;
