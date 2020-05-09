/*
 * This module is a side-effect filled module to load in the proper logger.
 */
import semver from "semver"
import { isCI } from "gatsby-core-utils"

export const startLogger = (): void => {
  let inkExists = false
  try {
    inkExists = !!require.resolve(`ink`)
    // eslint-disable-next-line no-empty
  } catch (err) {}

  if (!process.env.GATSBY_LOGGER) {
    if (
      inkExists &&
      semver.satisfies(process.version, `>=8`) &&
      !isCI() &&
      typeof jest === `undefined`
    ) {
      process.env.GATSBY_LOGGER = `ink`
    } else {
      process.env.GATSBY_LOGGER = `yurnalist`
    }
  }
  // if child process - use ipc logger
  if (process.send) {
    // process.env.FORCE_COLOR = `0`

    require(`./loggers/ipc`)
  }

  if (process.env.GATSBY_LOGGER.includes(`json`)) {
    require(`./loggers/json`)
  } else if (process.env.GATSBY_LOGGER.includes(`yurnalist`)) {
    require(`./loggers/yurnalist`)
  } else {
    require(`./loggers/ink`)
  }
}
