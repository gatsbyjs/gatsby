const envinfo = require(`envinfo`)

module.exports = function info({
  clipboard: useClipboard,
  console: useConsole = true,
  report,
}) {
  try {
    return envinfo.run(
      {
        System: [`OS`, `CPU`, `Shell`],
        Binaries: [`Node`, `npm`, `Yarn`],
        Browsers: [`Chrome`, `Edge`, `Firefox`, `Safari`],
        npmPackages: `gatsby*`,
        npmGlobalPackages: `gatsby*`,
      },
      {
        console: useConsole,
        // Clipboard is not accessible when on a linux tty
        clipboard:
          process.platform === `linux` && !process.env.DISPLAY
            ? false
            : useClipboard,
        markdown: true,
      }
    )
  } catch (err) {
    report.error(`Unable to print environment info`)
    report.error(err)
  }
}
