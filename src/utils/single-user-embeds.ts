import { APIEmbed, JSONEncodable, User } from "discord.js";
import { Ranking } from "../db/schema/ranking";
import { DATE_FORMAT, DateRange } from "./date-format";
import { DateTime } from "luxon";

export function buildSingleUserEmbeds(
  user: User,
  points: Ranking[],
  range: DateRange
): APIEmbed | JSONEncodable<APIEmbed> {
  const pointsEmbed: APIEmbed | JSONEncodable<APIEmbed> = {
    title: `Points from ${
      range.from ? range.from.toFormat(DATE_FORMAT) : "ever"
    } - ${range.to ? range.to.toFormat(DATE_FORMAT) : "now"}`,
    description: `<@${user.id}> has ${points.length} points`,
    color: 0x00ff00,
    fields: points.map((point) => ({
      name: `ID: ${point.id}`,
      value: `Reason: ${point.reason}\nDate: ${DateTime.fromMillis(
        point.createdAt,
        { zone: "utc" }
      ).toFormat(DATE_FORMAT)}\nGiven by: <@${point.rankingUserId}>`,
    })),
  };

  return pointsEmbed;
}
