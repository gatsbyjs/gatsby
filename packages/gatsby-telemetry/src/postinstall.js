let enabled = false
try {
  const ci = require(`ci-info`)
  const Configstore = require(`configstore`)
  const config = new Configstore(`gatsby`, {}, { globalConfigPath: true })
  enabled = config.get(`telemetry.enabled`)
  if (enabled === undefined && !ci.isCI) {
    console.log(
      `Gatsby has started collecting anonymous usage analytics to help improve Gatsby for all users.\n` +
        `If you'd like to opt-out, you can use \`gatsby telemetry --disable\`\n` +
        `To learn more, checkout http://gatsby.dev/telemetry`
    )
  }
} catch (e) {
  // ignore
}
