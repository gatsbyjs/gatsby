import boxen, { BorderStyle } from "boxen"

const defaultConfig = {
  padding: 1,
  borderColor: `blue`,
  borderStyle: BorderStyle.Double,
}

const defaultMessage =
  `Gatsby collects anonymous usage analytics\n` +
  `to help improve Gatsby for all users.\n` +
  `\n` +
  `If you'd like to opt-out, you can use \`gatsby telemetry --disable\`\n` +
  `To learn more, checkout https://gatsby.dev/telemetry`

/**
 * Analytics notice for the end-user
 * @param {Object} config - The configuration that boxen accepts. https://github.com/sindresorhus/boxen#api
 * @param {string} message - Message shown to the end-user
 */
export const showAnalyticsNotification = (
  config = defaultConfig,
  message = defaultMessage
): void => {
  console.log(boxen(message, config))
}
