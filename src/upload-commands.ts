import env from "./env";
import { REST, Routes } from "discord.js";

import commands from "./commands";

const jsonedCommands = Array.from(commands.values())
  .filter((command) => "data" in command && "execute" in command)
  .map((command) => command.data.toJSON());

const rest = new REST().setToken(env.DC_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    const data = await rest.put(
      Routes.applicationGuildCommands(env.DC_CLIENT_ID, env.DC_GUILD_ID),
      { body: jsonedCommands }
    );

    console.log(
      `Successfully reloaded ${jsonedCommands.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
