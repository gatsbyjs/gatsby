import fs from "fs-extra"
import path from "path"

import {
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
} from "../utils/feedback"
import { IProgram } from "./types"

module.exports = async function clean(program: IProgram): Promise<void> {
  const { directory, report: reporter } = program

  const directories = [`.cache`, `public`]

  reporter.info(`Deleting ${directories.join(`, `)}`)

  await Promise.all(
    directories.map(dir => fs.remove(path.join(directory, dir)))
  )

  reporter.info(`Successfully deleted directories`)

  if (await userPassesFeedbackRequestHeuristic()) {
    showFeedbackRequest()
  }
}
