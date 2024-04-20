/*
 * This module is used to patch console through our reporter so we can track
 * these logs
 */
import util from "node:util"
import { reporter as gatsbyReporter } from "./reporter"

export function patchConsole(reporter: typeof gatsbyReporter): void {
  const originalLog = console.log
  const originalWarn = console.warn
  const originalInfo = console.info
  const originalError = console.error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log = function monkeyPatchedLog(...args: Array<any>): void {
    try {
      const [format, ...rest] = args
      reporter.log(util.format(format === undefined ? `` : format, ...rest))
    } catch (e) {
      originalError(e)
    }

    originalLog(...args)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn = function monkeyPatchedWarn(...args: Array<any>): void {
    try {
      const [format, ...rest] = args
      reporter.warn(util.format(format === undefined ? `` : format, ...rest))
    } catch (e) {
      originalError(e)
    }

    originalWarn(...args)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info = function monkeyPatchedInfo(...args: Array<any>): void {
    try {
      const [format, ...rest] = args
      reporter.info(util.format(format === undefined ? `` : format, ...rest))
    } catch (e) {
      originalError(e)
    }

    originalInfo(...args)
  }
  console.error = function monkeyPatchedError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    format: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: Array<any>
  ): void {
    try {
      reporter.error(util.format(format === undefined ? `` : format, ...args))
    } catch (e) {
      originalError(e)
    }

    originalError(format, ...args)
  }
}
