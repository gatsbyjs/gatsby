import { resolve } from "path"
import { v4 } from "uuid"
import { ensureDir } from "fs-extra"
import { registerHandler } from "segfault-handler"
import reporter from "gatsby-cli/lib/reporter"

const CACHE_LOGS_DIR = `.cache/logs`
const GATSBY_SEGFAULT_LOG = `gatsby-segfault`

/**
 * Listen for segfaults, and if we find one:
 *
 * - Print the stack trace and structured error to stderr
 * - Write the stack trace to `.cache/logs`
 */
export async function listenForSegfaults(root: string): Promise<void> {
  if (!process.env.GATSBY_EXPERIMENTAL_LISTEN_FOR_SEGFAULTS) {
    return
  }

  try {
    const cacheLogsDir = `${root}/${CACHE_LOGS_DIR}`
    const uuid = v4()
    const logFile = `${GATSBY_SEGFAULT_LOG}-${uuid}.log`
    const logFilePath = resolve(`${cacheLogsDir}/${logFile}`)

    await ensureDir(cacheLogsDir)

    registerHandler(logFilePath, () => {
      structureError(logFilePath)
    })
  } catch (error) {
    reporter.warn(`Failed to register listener for segfaults`) // Behave normally, but warn so we can identify if registration failed
  }
}

/**
 * Structured error indicating where the log file is written.
 *
 * `segfault-handler` automatically prints to stderr and there doesn't look
 * to be a way to disable that without adjusting the library itself.
 * @see {@link https://github.com/ddopson/node-segfault-handler#readme}
 */
function structureError(relativeLogFilePath: string): void {
  reporter.panic({
    id: `12000`,
    context: {
      relativeLogFilePath,
    },
  })
}
