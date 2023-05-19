import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import db from "../db";
import ranking from "../db/schema/ranking";
import { canManage, roleGuardMiddleware } from "../utils/role-guard";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import {
  DATE_FORMAT,
  getDateRange,
  respondWhenInvalid,
} from "../utils/date-format";
import { error } from "../responses/error";
import { buildSingleUserEmbeds } from "../utils/single-user-embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("show-user-points")
    .setDescription(
      "Shows the points and reasons of a user. If no date range is given, it will show the current month."
    )
    .addUserOption((opt) =>
      opt
        .setName("user")
        .setDescription("The user to show points for")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("from").setDescription(`From date (${DATE_FORMAT})`)
    )
    .addStringOption((opt) =>
      opt.setName("to").setDescription(`To date (${DATE_FORMAT})`)
    ),

  execute: roleGuardMiddleware([canManage])(
    async (interaction: ChatInputCommandInteraction<"cached">) => {
      try {
        const user = interaction.options.get("user");

        if (!user || !user.user) {
          interaction.reply({
            embeds: error("User is a required option"),
            ephemeral: true,
          });
          return;
        }

        if (user.user.bot) {
          interaction.reply({
            embeds: error("You can't show points of a bot"),
            ephemeral: true,
          });
          return;
        }

        const range = respondWhenInvalid(
          interaction,
          getDateRange(
            interaction.options.get("from")?.value?.toString(),
            interaction.options.get("to")?.value?.toString()
          )
        );

        if (!range) return;
        const { from, to } = range;

        let points = db
          .select()
          .from(ranking)
          .where(
            and(
              eq(ranking.rankedUserId, user.user.id),
              from ? gte(ranking.createdAt, from.toMillis()) : undefined,
              to ? lte(ranking.createdAt, to.toMillis()) : undefined
            )
          )
          .orderBy(asc(ranking.createdAt))
          .all();

        interaction.reply({
          embeds: [buildSingleUserEmbeds(user.user, points, range)],
          ephemeral: true,
        });
      } catch (err) {
        console.error(err);
        interaction.reply({
          embeds: error(),
          ephemeral: true,
        });
      }
    }
  ),
};
