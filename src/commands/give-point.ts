import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import db from "../db";
import ranking from "../db/schema/ranking";
import {
  canGivePoints,
  isFresh,
  roleGuardMiddleware,
} from "../utils/role-guard";
import { and, eq, gte } from "drizzle-orm";
import { DateTime } from "luxon";
import env from "../env";
import { error } from "../responses/error";
import { success } from "../responses/success";

export default {
  data: new SlashCommandBuilder()
    .setName("give-point")
    .setDescription("Give a point to a user")
    .addUserOption((opt) =>
      opt
        .setName("user")
        .setDescription("The user you want to give point to")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("reason")
        .setDescription("The reason for giving point to this user")
        .setMaxLength(env.DC_REASON_MAX_LENGTH)
        .setRequired(true)
    ),

  execute: roleGuardMiddleware([canGivePoints])(
    async (interaction: ChatInputCommandInteraction<"cached">) => {
      try {
        const user = interaction.options.get("user");
        const reason = interaction.options.get("reason");

        if (!user || !user.user || !reason || !reason.value) {
          interaction.reply({
            embeds: error(),
            ephemeral: true,
          });
          return;
        }

        if (isFresh(user.member)) {
          interaction.reply({
            embeds: error("You can't give point to a fresh user"),
            ephemeral: true,
          });
          return;
        }

        if (user.user.bot) {
          interaction.reply({
            embeds: error("You can't give point to a bot"),
            ephemeral: true,
          });
          return;
        }

        if (user.user.id === interaction.user.id) {
          interaction.reply({
            embeds: error("You can't give point to yourself"),
            ephemeral: true,
          });
          return;
        }

        const lastRating = db
          .select()
          .from(ranking)
          .where(
            and(
              eq(ranking.rankingUserId, interaction.user.id),
              gte(ranking.createdAt, DateTime.utc().startOf("day").toMillis())
            )
          )
          .limit(1)
          .all();

        // if (lastRating.length > 0) {
        //   interaction.reply({
        //     embeds: error("You have already gave point to someone today"),
        //     ephemeral: true,
        //   });
        //   return;
        // }

        db.insert(ranking)
          .values({
            createdAt: DateTime.utc().toMillis(),
            rankedUserId: user.user.id,
            rankingUserId: interaction.user.id,
            reason: reason.value.toString(),
          })
          .run();

        interaction.reply({
          embeds: success(
            `<@${interaction.user.id}> has given <@${user.user.id}> point for \`${reason.value}\``
          ),
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
