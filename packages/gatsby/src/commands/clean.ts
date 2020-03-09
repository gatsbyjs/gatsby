import path from "path"

import fs from "fs-extra"

import {
  showFeedbackRequest,
  userPassesFeedbackRequestHeuristic,
} from "../utils/feedback"

import { IProgram } from "./types"

export default async ({ directory, report }: IProgram): Promise<void> => {
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
