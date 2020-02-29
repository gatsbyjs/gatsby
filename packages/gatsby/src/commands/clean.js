const fs = require(`fs-extra`)
const path = require(`path`)
import {
  userPassesFeedbackRequestHeuristic,
  showFeedbackRequest,
} from "../utils/feedback"

module.exports = async function clean(args) {
  const { directory, report } = args

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
