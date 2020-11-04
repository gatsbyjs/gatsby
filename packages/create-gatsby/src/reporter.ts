import c from "ansi-colors"
// We don't want to depend on the whole of gatsby-cli, so we can't use reporter
export const reporter = {
  info: (message: string): void => console.log(message),
  verbose: (message: string): void => console.log(message),
  log: (message: string): void => console.log(message),
  success: (message: string): void => console.log(c.green(`✔ `) + message),
  error: (message: string): void => console.error(c.red(`✘ `) + message),
  panic: (message: string): void => {
    console.error(message)
    process.exit(1)
  },
  warn: (message: string): void => console.warn(message),
}
