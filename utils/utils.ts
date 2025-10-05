export default function extractJobIdFromUrl(url: string): string | null {
  // Regex patterns to match different LinkedIn job URL formats
  const patterns = [
    // Pattern 1: currentJobId parameter (collections pages)
    // Handles: ?currentJobId=123456&other=param, ?currentJobId=123456, &currentJobId=123456
    /[?&]currentJobId=(\d+)(?:[&\/#]|$)/,

    // Pattern 2: Direct job view URLs
    // Handles: /jobs/view/123456/, /jobs/view/123456?param, /jobs/view/123456
    /\/jobs\/view\/(\d+)(?:\/|\?|$)/,

    // Pattern 3: Job posting URLs (more specific to avoid false matches)
    // Handles: /jobs/123456/, /jobs/123456?param, /jobs/123456
    /\/jobs\/(\d+)(?:\/|\?|$)/,

    // Pattern 4: Search results with job ID
    /\/jobs\/search\/[^?]*\?[^#]*currentJobId=(\d+)(?:[&\/#]|$)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if a given date string is within the current week (Monday to Sunday)
 * @param dateString - Date string in ISO format or parseable format
 * @returns boolean - true if the date is within the current week
 */
export function isDateInCurrentWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();

  // Get the start of the current week (Monday)
  const currentDay = now.getDay();
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Sunday is 0, Monday is 1
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysFromMonday);
  weekStart.setHours(0, 0, 0, 0);

  // Get the end of the current week (Sunday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return date >= weekStart && date <= weekEnd;
}
