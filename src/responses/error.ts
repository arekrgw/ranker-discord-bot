import { APIEmbed, JSONEncodable } from "discord.js";

export const error = (
  message?: string
): (APIEmbed | JSONEncodable<APIEmbed>)[] => {
  return [
    {
      title: "Something went wrong!",
      description: message,
      color: 0xff0000,
    },
  ];
};
