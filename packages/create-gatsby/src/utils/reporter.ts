import colors from "ansi-colors"

// We don't want to depend on the whole of gatsby-cli, so we can't use reporter
export const reporter = {
  info: (message: string): void => console.log(message),
  verbose: (message: string): void => console.log(message),
  log: (message: string): void => console.log(message),
  success: (message: string): void =>
    console.log(colors.green(colors.symbols.check + ` `) + message),
  error: (message: string): void =>
    console.error(colors.red(colors.symbols.cross + ` `) + message),
  panic: (message: string): never => {
    console.error(message)
    process.exit(1)
  },
  warn: (message: string): void => console.warn(colors.yellow(message)),
}
