import { APIEmbed, JSONEncodable } from "discord.js";
export function success(
  options: APIEmbed | JSONEncodable<APIEmbed>
): (APIEmbed | JSONEncodable<APIEmbed>)[];

export function success(
  message?: string
): (APIEmbed | JSONEncodable<APIEmbed>)[];

export function success(
  messageOrOptions?: string | APIEmbed | JSONEncodable<APIEmbed>
): (APIEmbed | JSONEncodable<APIEmbed>)[] {
  if (typeof messageOrOptions === "object") {
    return [{ color: 0x00ff00, ...messageOrOptions }];
  }

  return [
    {
      description: messageOrOptions,
      color: 0x00ff00,
    },
  ];
}
