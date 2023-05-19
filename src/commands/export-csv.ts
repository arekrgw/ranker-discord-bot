import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import db from "../db";
import ranking from "../db/schema/ranking";
import { canManage, roleGuardMiddleware } from "../utils/role-guard";
import { and, gte, lte } from "drizzle-orm";
import {
  DATE_FORMAT,
  getDateRange,
  respondWhenInvalid,
} from "../utils/date-format";
import { error } from "../responses/error";
import { DateTime } from "luxon";
import { AttachmentBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("export-csv")
    .setDescription(
      "Exports data in CSV format. If no date range is given, it will export data for the current month."
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
        const range = respondWhenInvalid(
          interaction,
          getDateRange(
            interaction.options.get("from")?.value?.toString(),
            interaction.options.get("to")?.value?.toString()
          )
        );

        if (!range) return;
        const { from, to } = range;

        const users = (await interaction.guild.members.fetch()).toJSON();

        const points = db
          .select()
          .from(ranking)
          .where(
            and(
              from ? gte(ranking.createdAt, from.toMillis()) : undefined,
              to ? lte(ranking.createdAt, to.toMillis()) : undefined
            )
          )
          .all();

        if (points.length === 0) {
          interaction.reply({
            embeds: error("No points were found for the given timeframe"),
            ephemeral: true,
          });
          return;
        }

        await interaction.deferReply({ ephemeral: true });

        const combinedWithUserNames = points.map((p) => {
          const rankedUserName =
            users.find((u) => u.id === p.rankedUserId)?.user.username ??
            "Unknown";
          const rankingUserName =
            users.find((u) => u.id === p.rankingUserId)?.user.username ??
            "Unknown";
          const formattedDate = DateTime.fromMillis(p.createdAt, {
            zone: "utc",
          }).toFormat(DATE_FORMAT);

          return {
            ...p,
            rankedUserName,
            rankingUserName,
            createdAt: formattedDate,
          };
        });

        const chunksize = 50000;

        const chunkedCSV = [];

        for (let i = 0; i < combinedWithUserNames.length; i += chunksize) {
          chunkedCSV.push(
            [
              "id,rankedUserId,rankedUserName,rankingUserId,rankingUserName,reason,createdAt",
              ...combinedWithUserNames
                .slice(i, i + chunksize)
                .map(
                  (p) =>
                    `${p.id},${p.rankedUserId},${p.rankedUserName},${p.rankingUserId},${p.rankingUserName},${p.reason},${p.createdAt}`
                ),
            ].join("\n")
          );
        }

        const attachements = chunkedCSV.map((csv, i) =>
          new AttachmentBuilder(Buffer.from(csv)).setName(
            `points_${i + 1}_${from ? from.toFormat(DATE_FORMAT) : "ever"}_${
              to ? to.toFormat(DATE_FORMAT) : "now"
            }.csv`
          )
        );

        interaction.editReply({
          files: attachements,
        });
      } catch (err) {
        console.error(err);
        if (interaction.deferred) {
          interaction.editReply({
            embeds: error(),
          });
          return;
        }

        interaction.reply({
          embeds: error(),
          ephemeral: true,
        });
      }
    }
  ),
};
