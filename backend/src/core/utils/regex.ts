/**
 * Safely escapes special regex characters to prevent regex injection (ReDoS).
 */
export function escapeRegex(input: string): string {
  return input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
