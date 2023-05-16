import { GuildMember, PermissionsBitField } from "discord.js";

export function isAdmin(member: GuildMember) {
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}
