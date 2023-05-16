import { ChatInputCommandInteraction } from "discord.js";
import { DateTime } from "luxon";
import { error } from "../responses/error";

export const DATE_FORMAT = "yyyy-MM-dd";

export type DateRange = {
  from: DateTime | null;
  to: DateTime | null;
};

/**
 * Returns the date range from the given `from` and `to` dates.
 * If dates are not defined returns the range of current month.
 */
export function getDateRange(
  from: string | undefined,
  to: string | undefined,
  noDefault = false
): DateRange {
  if (!from && !to && !noDefault) {
    const now = DateTime.utc();
    return {
      from: now.startOf("month"),
      to: now.endOf("month"),
    };
  }

  const f = DateTime.fromFormat(from || "", DATE_FORMAT, {
    zone: "utc",
    setZone: true,
  });
  const t = DateTime.fromFormat(to || "", DATE_FORMAT, {
    zone: "utc",
    setZone: true,
  });

  return {
    from: from ? f.startOf("day") : null,
    to: to ? t.endOf("day") : null,
  };
}

export function respondWhenInvalid(
  interaction: ChatInputCommandInteraction<"cached">,
  dateRange: DateRange
): DateRange | false {
  const { from, to } = dateRange;

  if (from && !from.isValid) {
    interaction.reply({
      embeds: error(
        `\`From\` date is invalid. It should be formatted as (${DATE_FORMAT})`
      ),
      ephemeral: true,
    });
    return false;
  }

  if (to && !to.isValid) {
    interaction.reply({
      embeds: error(
        `\`From\` date is invalid. It should be formatted as (${DATE_FORMAT})`
      ),
      ephemeral: true,
    });
    return false;
  }

  return dateRange;
}
