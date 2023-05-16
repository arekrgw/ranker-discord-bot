import { APIEmbed, JSONEncodable } from "discord.js";
import { DATE_FORMAT, DateRange } from "./date-format";

export function leaderboardEmbed(
  rank: {
    rankedUserId: string;
    points: number;
  }[],
  range: DateRange
) {
  const titleEmbed: APIEmbed | JSONEncodable<APIEmbed> = {
    title: `🎉🎉 Leaderboard, from ${
      range.from ? range.from.toFormat(DATE_FORMAT) : "ever"
    } - ${range.to ? range.to.toFormat(DATE_FORMAT) : "now"} 🎉🎉`,
    description: `There are ${rank.length} users on the leaderboard, who has at least 1 point!!`,
    color: 0x00ff00,
  };

  const top3Title = ["🥇 1st", "🥈 2nd", "🥉 3rd"];
  const top3Color = [0xffd700, 0xc0c0c0, 0xcd7f32];

  const top3 = rank
    .slice(0, 3)
    .map((user, index): APIEmbed | JSONEncodable<APIEmbed> => ({
      title: `${top3Title[index]} place`,
      description: `<@${user.rankedUserId}> has ${user.points} point${
        user.points > 1 ? "s" : ""
      }`,
      color: top3Color[index],
    }));

  const response = [titleEmbed, ...top3];

  if (rank.length > 3) {
    const rest: APIEmbed | JSONEncodable<APIEmbed> = {
      title: "The rest of the leaderboard",
      fields: rank.slice(0).map((user, index) => ({
        name: `${index + 4}th place`,
        value: `<@${user.rankedUserId}>\nPoints: ${user.points}`,
      })),
    };

    response.push(rest);
  }

  return response;
}
