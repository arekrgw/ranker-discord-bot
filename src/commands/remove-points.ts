import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import db from "../db";
import ranking from "../db/schema/ranking";
import { canManage, roleGuardMiddleware } from "../utils/role-guard";
import { and, eq, gte, lte, or } from "drizzle-orm";
import {
  DATE_FORMAT,
  getDateRange,
  respondWhenInvalid,
} from "../utils/date-format";
import { error } from "../responses/error";
import { success } from "../responses/success";

export default {
  data: new SlashCommandBuilder()
    .setName("remove-points")
    .setDescription(
      "Removes points from a user by either ID or date range or all."
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
    )
    .addStringOption((opt) =>
      opt
        .setName("identifiers")
        .setDescription("The identifiers of the points to remove")
    )
    .addBooleanOption((opt) =>
      opt.setName("all").setDescription("Remove all points")
    ),

  execute: roleGuardMiddleware([canManage])(
    async (interaction: ChatInputCommandInteraction<"cached">) => {
      try {
        const user = interaction.options.get("user", true);
        const all = Boolean(interaction.options.get("all")?.value);
        const fromS = interaction.options.get("from")?.value?.toString();
        const toS = interaction.options.get("to")?.value?.toString();
        const identifiers = interaction.options
          .get("identifiers")
          ?.value?.toString();

        if (!user || !user.user) {
          interaction.reply({
            embeds: error("User is a required option"),
            ephemeral: true,
          });
          return;
        }

        if (user.user.bot) {
          interaction.reply({
            embeds: error("You can't remove points of a bot"),
            ephemeral: true,
          });
          return;
        }

        if (
          (all && (fromS || toS || identifiers)) ||
          (identifiers && (all || fromS || toS)) ||
          (fromS && (all || identifiers)) ||
          (toS && (all || identifiers))
        ) {
          interaction.reply({
            embeds: error(
              "You can only use one of the following options: `all`, `identifiers` or time range (`from` and `to`)"
            ),
            ephemeral: true,
          });
          return;
        }

        if (all) {
          db.delete(ranking)
            .where(eq(ranking.rankedUserId, user.user.id))
            .run();

          interaction.reply({
            embeds: success(`Removed all points from <@${user.user.id}>`),
            ephemeral: true,
          });
          return;
        }

        if (identifiers) {
          const ids = identifiers.split(",").map((id) => Number(id.trim()));

          if (ids.some((id) => isNaN(id))) {
            interaction.reply({
              embeds: error(
                "Invalid identifiers, please enter them as numbers in format `1, 2, 3`"
              ),
              ephemeral: true,
            });
            return;
          } else {
            db.delete(ranking)
              .where(
                and(
                  eq(ranking.rankedUserId, user.user.id),
                  or(...ids.map((id) => eq(ranking.id, id)))
                )
              )
              .run();
            interaction.reply({
              embeds: success(`Removed choosen points from <@${user.user.id}>`),
              ephemeral: true,
            });
            return;
          }
        }

        if (fromS || toS) {
          const range = respondWhenInvalid(
            interaction,
            getDateRange(fromS, toS, true)
          );
          if (!range) return;
          const { from, to } = range;

          db.delete(ranking)
            .where(
              and(
                eq(ranking.rankedUserId, user.user.id),
                from ? gte(ranking.createdAt, from.toMillis()) : undefined,
                to ? lte(ranking.createdAt, to.toMillis()) : undefined
              )
            )
            .run();

          interaction.reply({
            embeds: success(
              `Removed points from <@${user.user.id}> from ${
                from ? from.toFormat(DATE_FORMAT) : "ever"
              } - ${to ? to.toFormat(DATE_FORMAT) : "now"}`
            ),
            ephemeral: true,
          });

          return;
        }

        interaction.reply({
          embeds: error(
            "You need to specify either `all` or `identifiers` or time range (`from` and `to`)"
          ),
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
