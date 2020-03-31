import boxen, { BorderStyle } from "boxen"

// boxen uses const enums to describe config.borderStyle.
// Unfortunately, Babel does not support const enums, so
// we need to do some type gymnastics.
type BorderStyleConstEnum = keyof typeof BorderStyle

const defaultConfig = {
  padding: 1,
  borderColor: `blue`,
  borderStyle: `double` as BorderStyleConstEnum,
}

const defaultMessage =
  `Gatsby collects anonymous usage analytics\n` +
  `to help improve Gatsby for all users.\n` +
  `\n` +
  `If you'd like to opt-out, you can use \`gatsby telemetry --disable\`\n` +
  `To learn more, checkout https://gatsby.dev/telemetry`

/**
 * Analytics notice for the end-user
 * @param config - The configuration that boxen accepts. https://github.com/sindresorhus/boxen#api
 * @param message - Message shown to the end-user
 */
export const showAnalyticsNotification = (
  config = defaultConfig,
  message: string = defaultMessage
): void => {
  console.log(boxen(message, (config as unknown) as boxen.Options))
}
