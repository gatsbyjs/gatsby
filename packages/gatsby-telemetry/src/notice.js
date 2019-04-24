const boxen = require(`boxen`)

const defaultConfig = {
  padding: 1,
  borderColor: `blue`,
}

const defaultMessage =
  `Gatsby has started collecting anonymous usage analytics to help improve Gatsby for all users.\n` +
  `If you'd like to opt-out, you can use \`gatsby telemetry --disable\`\n` +
  `To learn more, checkout http://gatsby.dev/telemetry`

const notice = (config = defaultConfig, message = defaultMessage) =>
  console.log(boxen(message, config))

module.exports = notice
