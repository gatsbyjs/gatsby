/*
 * This module is a side-effect filled module to load in the proper logger.
 */
import semver from "semver"
import { isCI } from "gatsby-core-utils"

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
  if (process.send && !process.env.GATSBY_WORKER_POOL_WORKER) {
    // FIXME: disable IPC logger when inside worker. IPC messages crash jest-worker.
    // This is just workaround to not crash process when reporter is used in worker context.
    // process.env.FORCE_COLOR = `0`

    // TODO move to dynamic imports
    require(`./loggers/ipc`).initializeIPCLogger()
  }

  if (process.env.GATSBY_LOGGER.includes(`json`)) {
    // TODO move to dynamic imports
    require(`./loggers/json`).initializeJSONLogger()
  } else if (process.env.GATSBY_LOGGER.includes(`yurnalist`)) {
    // TODO move to dynamic imports
    require(`./loggers/yurnalist`).initializeYurnalistLogger()
  } else {
    // TODO move to dynamic imports
    require(`./loggers/ink`).initializeINKLogger()
  }
}
