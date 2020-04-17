import fs from "fs-extra"
import path from "path"

import {
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
} from "../utils/feedback"
import { IProgram } from "./types"

module.exports = async function clean(program: IProgram): Promise<void> {
  const { directory, report } = program

  const directories = [`.cache`, `public`]

  report.info(`Deleting ${directories.join(`, `)}`)

  await Promise.all(
    directories.map(dir => fs.remove(path.join(directory, dir)))
  )

  report.info(`Successfully deleted directories`)

  if (await userPassesFeedbackRequestHeuristic()) {
    showFeedbackRequest()
  }
}
