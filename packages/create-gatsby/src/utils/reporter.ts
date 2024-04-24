import colors from "ansi-colors";

// We don't want to depend on the whole of gatsby-cli, so we can't use reporter
export const reporter = {
  info: (message: string): void => {
    return console.log(message);
  },
  verbose: (message: string): void => {
    return console.log(message);
  },
  log: (message: string): void => {
    return console.log(message);
  },
  success: (message: string): void => {
    return console.log(colors.green(colors.symbols.check + " ") + message);
  },
  error: (message: string): void => {
    return console.error(colors.red(colors.symbols.cross + " ") + message);
  },
  panic: (message: string): never => {
    console.error(message);
    process.exit(1);
  },
  warn: (message: string): void => {
    return console.warn(colors.yellow(message));
  },
};
