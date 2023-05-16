import env from "../env";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { error } from "../responses/error";

export function isRole(roleId: string, member?: GuildMember) {
  if (!member) return false;
  return member.roles.cache.has(roleId);
}

export function isManager(member?: GuildMember) {
  return isRole(env.DC_MANAGER_ROLE_ID, member);
}

export function isFresh(member?: GuildMember) {
  return isRole(env.DC_FRESH_ROLE_ID, member);
}

export function canGivePoints(member?: GuildMember) {
  return !isFresh(member);
}

export function canManage(member?: GuildMember) {
  return isManager(member);
}

export function roleGuardMiddleware(
  bools: ((member?: GuildMember) => boolean)[],
  type: "all" | "any" = "any"
) {
  return (
    handler: (interaction: ChatInputCommandInteraction<"cached">) => void
  ) => {
    return async (interaction: ChatInputCommandInteraction<"cached">) => {
      let cannotPass = !bools[type === "all" ? "every" : "some"]((b) =>
        b(interaction.member)
      );

      if (cannotPass) {
        interaction.reply({
          embeds: error("You are not authorized to use this command."),
          ephemeral: true,
        });
        return;
      }

      handler(interaction);
    };
  };
}
