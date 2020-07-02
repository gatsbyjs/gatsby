import chalk from "chalk"

function formatLogMessage(input, { verbose = false } = {}): string {
  let message
  if (typeof input === `string`) {
    message = input
  } else {
    message = input[0]
  }

  return verbose
    ? `${chalk.white.bgBlue(` gatsby-graphql-toolkit `)} ${message}`
    : `[gatsby-graphql-toolkit] ${message}`
}

export { formatLogMessage }
