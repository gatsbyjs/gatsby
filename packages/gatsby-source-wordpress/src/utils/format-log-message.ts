import chalk from "chalk"
import store from "~/store"

const formatLogMessage = (
  input: string | Array<string>,
  { useVerboseStyle }: { useVerboseStyle?: boolean } = {}
): string => {
  let verbose = false

  if (typeof useVerboseStyle === `undefined`) {
    verbose = store.getState().gatsbyApi.pluginOptions.verbose
  }

  let message
  if (typeof input === `string`) {
    message = input
  } else {
    message = input[0]
  }

  return verbose || useVerboseStyle
    ? `${chalk.blue(` gatsby-source-wordpress `)} ${message}`
    : `[gatsby-source-wordpress] ${message}`
}

export { formatLogMessage }
