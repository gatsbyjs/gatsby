/*
 * This module is a side-effect filled module to load in the proper logger.
 */
import semver from "semver"
import { isCI } from "gatsby-core-utils"
import { initializeIPCLogger } from "./loggers/ipc"
import { initializeJSONLogger } from "./loggers/json"
import { initializeYurnalistLogger } from "./loggers/yurnalist"
import { initializeINKLogger } from "./loggers/ink"

export const startLogger = (): void => {
  if (!process.env.GATSBY_LOGGER) {
    if (
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

    initializeIPCLogger()
  }

  if (process.env.GATSBY_LOGGER.includes(`json`)) {
    initializeJSONLogger()
  } else if (process.env.GATSBY_LOGGER.includes(`yurnalist`)) {
    initializeYurnalistLogger()
  } else {
    initializeINKLogger()
  }
}
