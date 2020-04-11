/*
 * This module is used to patch console through our reporter so we can track
 * these logs
 */
import util from "util"
import { reporter as gatsbyReporter } from "./reporter"

export const patchConsole = (reporter: typeof gatsbyReporter): void => {
  console.log = (format: any, ...args: any[]): void => {
    if (format) {
      reporter.log(util.format(format, ...args))
      return
    }
    reporter.log()
  }
  console.warn = (format: any, ...args: any[]): void => {
    if (format) {
      reporter.warn(util.format(format, ...args))
      return
    }
    reporter.warn()
  }
  console.info = (format: any, ...args: any[]): void => {
    if (format) {
      reporter.info(util.format(format, ...args))
      return
    }
    reporter.info()
  }
  console.error = (format: any, ...args: any[]): void => {
    reporter.error(util.format(format, ...args))
  }
}
