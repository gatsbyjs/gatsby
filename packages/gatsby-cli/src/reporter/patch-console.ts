/*
 * This module is used to patch console through our reporter so we can track
 * these logs
 */
import util from "util"
import { reporter as gatsbyReporter } from "./reporter"

export const patchConsole = (reporter: typeof gatsbyReporter): void => {
  console.log = (...args: any[]): void => {
    const [format, ...rest] = args
    reporter.log(util.format(format === undefined ? `` : format, ...rest))
  }
  console.warn = (...args: any[]): void => {
    const [format, ...rest] = args
    reporter.warn(util.format(format === undefined ? `` : format, ...rest))
  }
  console.info = (...args: any[]): void => {
    const [format, ...rest] = args
    reporter.info(util.format(format === undefined ? `` : format, ...rest))
  }
  console.error = (format: any, ...args: any[]): void => {
    reporter.error(util.format(format, ...args))
  }
}
