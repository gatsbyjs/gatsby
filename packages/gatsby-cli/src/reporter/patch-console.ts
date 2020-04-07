/*
 * This module is used to patch console through our reporter so we can track
 * these logs
 */
import util from "util"
import { reporter as gatsbyReporter } from "./reporter"

export const patchConsole = (reporter: typeof gatsbyReporter): void => {
  console.log = (format: any, ...args: any[]): void => {
    reporter.log(util.format(format, ...args))
  }
  console.warn = (format: any, ...args: any[]): void => {
    reporter.warn(util.format(format, ...args))
  }
  console.info = (format: any, ...args: any[]): void => {
    reporter.info(util.format(format, ...args))
  }
  console.error = (format: any, ...args: any[]): void => {
    reporter.error(util.format(format, ...args))
  }
}
