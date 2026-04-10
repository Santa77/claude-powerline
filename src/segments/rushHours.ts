const RUSH_START_UTC_HOUR = 13;
const RUSH_END_UTC_HOUR = 19;

export interface RushHoursInfo {
  isRush: boolean;
  isWeekend: boolean;
  /** Minutes until end of rush (if isRush), or until start of next rush (if !isRush) */
  countdownMinutes: number;
}

function minutesToNextRush(now: Date): number {
  const utcDay = now.getUTCDay();
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const curMins = utcHour * 60 + utcMin;
  const rushStart = RUSH_START_UTC_HOUR * 60;

  // Weekday before today's rush window
  if (utcDay >= 1 && utcDay <= 5 && curMins < rushStart) {
    return rushStart - curMins;
  }

  // Find the next weekday (Mon–Fri) at rush start
  let daysAhead = 1;
  let nextDay = (utcDay + 1) % 7;
  while (nextDay === 0 || nextDay === 6) {
    daysAhead++;
    nextDay = (utcDay + daysAhead) % 7;
  }

  const minsLeftToday = 24 * 60 - curMins;
  const minsInBetweenDays = (daysAhead - 1) * 24 * 60;
  return minsLeftToday + minsInBetweenDays + rushStart;
}

export function getRushHoursInfo(): RushHoursInfo {
  const now = new Date();
  const utcDay = now.getUTCDay(); // 0=Sun, 6=Sat
  const isWeekend = utcDay === 0 || utcDay === 6;

  if (!isWeekend) {
    const curMins = now.getUTCHours() * 60 + now.getUTCMinutes();
    const rushStart = RUSH_START_UTC_HOUR * 60;
    const rushEnd = RUSH_END_UTC_HOUR * 60;

    if (curMins >= rushStart && curMins < rushEnd) {
      return {
        isRush: true,
        isWeekend: false,
        countdownMinutes: rushEnd - curMins,
      };
    }
  }

  return {
    isRush: false,
    isWeekend,
    countdownMinutes: minutesToNextRush(now),
  };
}
