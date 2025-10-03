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
