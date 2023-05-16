import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import db from "../db";
import ranking from "../db/schema/ranking";
import { canManage, roleGuardMiddleware } from "../utils/role-guard";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import {
  DATE_FORMAT,
  getDateRange,
  respondWhenInvalid,
} from "../utils/date-format";
import { success } from "../responses/success";

export default {
  data: new SlashCommandBuilder()
    .setName("my-points")
    .setDescription("Shows how many points you got.")
    .addStringOption((opt) =>
      opt.setName("from").setDescription(`From date (${DATE_FORMAT})`)
    )
    .addStringOption((opt) =>
      opt.setName("to").setDescription(`To date (${DATE_FORMAT})`)
    ),

  execute: roleGuardMiddleware([canManage])(
    async (interaction: ChatInputCommandInteraction<"cached">) => {
      try {
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
          .select({
            rankedUserId: ranking.rankedUserId,
            sum: sql<number>`count(*)`,
          })
          .from(ranking)
          .where(
            and(
              eq(ranking.rankedUserId, interaction.user.id),
              from ? gte(ranking.createdAt, from.toMillis()) : undefined,
              to ? lte(ranking.createdAt, to.toMillis()) : undefined
            )
          )
          .groupBy(ranking.rankedUserId)
          .having(eq(ranking.rankedUserId, interaction.user.id))
          .all();

        const timeframe = `Timeframe: ${
          from ? from.toFormat(DATE_FORMAT) : "ever"
        } - ${to ? to.toFormat(DATE_FORMAT) : "now"}`;

        if (points.length === 0) {
          interaction.reply({
            embeds: success({
              title: "Your points",
              description: "You have no points",
              footer: {
                text: timeframe,
              },
            }),
            ephemeral: true,
          });
          return;
        }

        interaction.reply({
          embeds: success({
            title: "Your points",
            description: `You have ${points[0].sum} points`,
            footer: {
              text: timeframe,
            },
          }),
          ephemeral: true,
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
