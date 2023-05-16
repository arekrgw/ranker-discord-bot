import { ChatInputCommandInteraction } from "discord.js";

export function unauthorizedReply(message: ChatInputCommandInteraction) {
  message.reply({
    content: "You are not authorized to use this command.",
    ephemeral: true,
  });
}
