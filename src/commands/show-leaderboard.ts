import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import db from "../db";
import ranking from "../db/schema/ranking";
import { canManage, roleGuardMiddleware } from "../utils/role-guard";
import { and, desc, gte, lte, sql } from "drizzle-orm";
import {
  DATE_FORMAT,
  getDateRange,
  respondWhenInvalid,
} from "../utils/date-format";
import { leaderboardEmbed } from "../utils/leaderboard";
import { error } from "../responses/error";

export default {
  data: new SlashCommandBuilder()
    .setName("show-leaderboard")
    .setDescription(
      "Shows leaderboard. If no date range is given, it will show it for the current month."
    )
    .addStringOption((opt) =>
      opt.setName("from").setDescription(`From date (${DATE_FORMAT})`)
    )
    .addStringOption((opt) =>
      opt.setName("to").setDescription(`To date (${DATE_FORMAT})`)
    )
    .addBooleanOption((opt) =>
      opt.setName("private").setDescription(`Show leaderboard only to you`)
    ),

  execute: roleGuardMiddleware([canManage])(
    async (interaction: ChatInputCommandInteraction<"cached">) => {
      try {
        const priv = !!interaction.options.getBoolean("private");
        const range = respondWhenInvalid(
          interaction,
          getDateRange(
            interaction.options.get("from")?.value?.toString(),
            interaction.options.get("to")?.value?.toString()
          )
        );

        if (!range) return;
        const { from, to } = range;

        const sq = sql<number>`count(*)`.as("points");

        let points = db
          .select({
            rankedUserId: ranking.rankedUserId,
            points: sq,
          })
          .from(ranking)
          .where(
            and(
              from ? gte(ranking.createdAt, from.toMillis()) : undefined,
              to ? lte(ranking.createdAt, to.toMillis()) : undefined
            )
          )
          .orderBy(desc(sq))
          .groupBy(ranking.rankedUserId)
          .all();
        if (points.length === 0) {
          interaction.reply({
            embeds: error("No points were found for the given timeframe"),
            ephemeral: true,
          });
          return;
        }

        interaction.reply({
          embeds: leaderboardEmbed(points, range),
          ephemeral: priv,
        });
      } catch (error) {
        console.error(error);
        interaction.reply({
          content: "Something unexpected happened",
          ephemeral: true,
        });
      }
    }
  ),
};
