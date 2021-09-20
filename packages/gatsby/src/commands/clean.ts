import fs from "fs-extra"
import path from "path"
import findCacheDir from "find-cache-dir"

import {
  userGetsSevenDayFeedback,
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
  showSevenDayFeedbackRequest,
} from "../utils/feedback"
import { IProgram } from "./types"

module.exports = async function clean(program: IProgram): Promise<void> {
  const { directory, report } = program

  const directories = [
    `.cache`,
    `public`,
    // Ensure we clean babel loader cache
    findCacheDir({
      name: `babel-loader`,
    }),
    findCacheDir({
      name: `terser-webpack-plugin`,
    }),
  ].filter(Boolean)

  report.info(`Deleting ${directories.join(`, `)}`)

  await Promise.all(
    directories.map(dir => fs.remove(path.join(directory, dir)))
  )

  report.info(`Successfully deleted directories`)

  if (await userGetsSevenDayFeedback()) {
    showSevenDayFeedbackRequest()
  } else if (await userPassesFeedbackRequestHeuristic()) {
    showFeedbackRequest()
  }
}
