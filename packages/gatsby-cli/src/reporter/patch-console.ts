/*
 * This module is used to patch console through our reporter so we can track
 * these logs
 */
import util from "util"
import { reporter as gatsbyReporter } from "./reporter"

export const patchConsole = (reporter: typeof gatsbyReporter): void => {
  console.log = (format: any, ...args: any[]): void => {
    format ? reporter.log(util.format(format, ...args)) : reporter.log()
  }
  console.warn = (format: any, ...args: any[]): void => {
    format ? reporter.warn(util.format(format, ...args)) : reporter.warn()
  }
  console.info = (format: any, ...args: any[]): void => {
    format ? reporter.info(util.format(format, ...args)) : reporter.info()
  }
  console.error = (format: any, ...args: any[]): void => {
    reporter.error(util.format(format, ...args))
  }
}
