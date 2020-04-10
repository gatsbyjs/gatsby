import chalk from "chalk"
import store from "~/store"

const formatLogMessage = (input, { useVerboseStyle = false } = {}) => {
  const { verbose } = store.getState().gatsbyApi.pluginOptions

  let message
  if (typeof input === `string`) {
    message = input
  } else {
    message = input[0]
  }

  return verbose || useVerboseStyle
    ? `${chalk.white.bgBlue(` gatsby-source-wordpress `)} ${message}`
    : `[gatsby-source-wordpress] ${message}`
}

export { formatLogMessage }
