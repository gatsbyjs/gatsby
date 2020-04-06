/*
 * This module is used to patch console through our reporter so we can track
 * these logs
 */
import util from "util"
import { reporter as gatsbyReporter } from "./reporter"

export const patchConsole = (reporter: typeof gatsbyReporter): void => {
  console.log = (format: any, ...args: any[]) =>
    reporter.log(util.format(format, ...args))
  console.warn = (format: any, ...args: any[]) =>
    reporter.warn(util.format(format, ...args))
  console.info = (format: any, ...args: any[]) =>
    reporter.info(util.format(format, ...args))
  console.error = (format: any, ...args: any[]) =>
    reporter.error(util.format(format, ...args))
}
