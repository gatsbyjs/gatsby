/**
 * Hide string on windows (for emojis)
 */
export function maybeUseEmoji(input: string): string {
  return process.platform === "win32" ? "" : input;
}
