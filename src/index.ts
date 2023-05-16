import env from "./env";
import client from "./client";
import { Events } from "discord.js";
import commands from "./commands";
import { NoCommandFound } from "./errors";
import "./upload-commands";

client.once(Events.ClientReady, () => console.log("Ready!"));

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;
  try {
    const command = commands.get(interaction.commandName);

    if (!command) {
      throw new NoCommandFound(interaction.commandName);
    }

    await command.execute(interaction);
  } catch (error) {
    if (error instanceof NoCommandFound) {
      await interaction.reply({ content: error.message, ephemeral: true });
    }
  }
});

client.login(env.DC_TOKEN);
