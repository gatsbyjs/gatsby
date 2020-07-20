import boxen from "boxen"

const defaultConfig = {
  padding: 1,
  borderColor: `blue`,
  borderStyle: `double`,
} as boxen.Options

const defaultMessage =
  `Gatsby collects anonymous usage analytics\n` +
  `to help improve Gatsby for all users.\n` +
  `\n` +
  `If you'd like to opt-out, you can use \`gatsby telemetry --disable\`\n` +
  `To learn more, checkout https://gatsby.dev/telemetry`

/**
 * Analytics notice for the end-user
 */
export function showAnalyticsNotification(
  config: boxen.Options = defaultConfig,
  message: string = defaultMessage
): void {
  console.log(boxen(message, config))
}
