import * as boxen from 'boxen'
import { Options } from 'boxen'

const defaultConfig: Options = {
  padding: 1,
  borderColor: 'blue',
  // issues with enum in boxen
  // @ts-ignore
  borderStyle: 'double',
}

const defaultMessage =
  `Gatsby collects anonymous usage analytics\n` +
  `to help improve Gatsby for all users.\n` +
  `\n` +
  `If you'd like to opt-out, you can use \`gatsby telemetry --disable\`\n` +
  `To learn more, checkout https://gatsby.dev/telemetry`

/**
 * Analytics notice for the end-user
 * @param {Object} options - The configuration that boxen accepts. https://github.com/sindresorhus/boxen#api
 * @param {string} message - Message shown to the end-user
 */
export function showAnalyticsNotification (
  options = defaultConfig,
  message = defaultMessage
) {
  console.log(boxen(message, options))
}

