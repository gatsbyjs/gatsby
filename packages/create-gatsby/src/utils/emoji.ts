/**
 * Hide string on windows (for emojis)
 */
export const maybeUseEmoji = (input: string): string =>
  process.platform === `win32` ? `` : input
