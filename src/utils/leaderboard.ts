import { APIEmbed, JSONEncodable } from "discord.js";
import { DATE_FORMAT, DateRange } from "./date-format";

const stndrd = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export function leaderboardEmbed(
  rank: {
    rankedUserId: string;
    points: number;
  }[],
  range: DateRange
) {
  // split the array into 25 chunks
  const chunks = rank.reduce<NonNullable<APIEmbed["fields"]>[]>(
    (acc, curr, index) => {
      const chunkIndex = Math.floor(index / 25);

      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }

      acc[chunkIndex].push({
        name: `${stndrd(index + 1)} place`,
        value: `<@${curr.rankedUserId}>\nPoints: ${curr.points}`,
      });

      return acc;
    },
    []
  );

  const titleEmbed: APIEmbed | JSONEncodable<APIEmbed> = {
    title: `🎉🎉 Leaderboard, from ${
      range.from ? range.from.toFormat(DATE_FORMAT) : "ever"
    } - ${range.to ? range.to.toFormat(DATE_FORMAT) : "now"} 🎉🎉`,
    description: `There are ${rank.length} users on the leaderboard, who has at least 1 point!!`,
    fields: chunks[0],
    color: 0x00ff00,
  };

  const embeds: APIEmbed[] = chunks.slice(1).map((chunk) => ({
    fields: chunk,
    color: 0x00ff00,
  }));

  return [titleEmbed, ...embeds];
}
