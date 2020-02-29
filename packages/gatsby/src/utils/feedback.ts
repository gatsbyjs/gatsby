import report from "gatsby-cli/lib/reporter"
import { getConfigStore, getGatsbyVersion } from "gatsby-core-utils"
import latestVersion from "latest-version"

const feedbackKey = `feedback.disabled`
const lastDateKey = `feedback.lastRequestDate`

// This function is designed to be used by `gatsby feedback --disable`
// and `gatsby feedback --enable`. This key is used to determine
// if a user is allowed to be solicited for feedback
export function setFeedbackDisabledValue(enabled: boolean): void {
  getConfigStore().set(feedbackKey, enabled)
}

// Print the feedback request to the user
export function showFeedbackRequest(): void {
  getConfigStore().set(lastDateKey, Date.now())
  report.log(
    `\n\nHello! Will you help Gatsby improve by taking a four question survey?`
  )
  report.log(
    `Give us your feedback here: https://www.typeform.com/to/A9VWwT\n\n`
  )
}

// We are only showing feedback requests to users in if they pass a few checks:
// 1. They haven't disabled the feedback mechanism
// 2. They don't have the environment variable to disable feedback present
// 3. It's been at least 3 months since the last feedback request
// 4. They are on the most recent version of Gatsby
export async function userPassesFeedbackRequestHeuristic(): Promise<boolean> {
  // Heuristic 1
  if (getConfigStore().get(feedbackKey) === true) {
    return false
  }

  // Heuristic 2
  if (process.env.GATSBY_FEEDBACK_DISABLED === `1`) {
    return false
  }

  // Heuristic 3
  const lastDateValue = getConfigStore().get(lastDateKey)
  // 3.a if the user has never received the feedback request, this is undefined
  //     Which is effectively a pass, because it's been ~infinity~ since they last
  //     received a request from us.
  if (lastDateValue) {
    const lastDate = new Date(lastDateValue)
    const monthsSinceLastRequest = lastDate.getMonth() - new Date().getMonth()

    if (monthsSinceLastRequest < 3) {
      return false
    }
  }

  // Heuristic 4
  const versionPoints = getGatsbyVersion().split(`.`)
  const latestVersionPoints = (await latestVersion(`gatsby`)).split(`.`)

  // Since we push versions very frequently. So thinking that users will
  // be on the latest patch is potentially unrealistic. So we are just
  // comparing on major and minor version points.
  const versionsMatchOnMajorAndMinor =
    versionPoints[0] === latestVersionPoints[0] &&
    versionPoints[1] === latestVersionPoints[1]

  if (versionsMatchOnMajorAndMinor === false) {
    return false
  }

  // If all of the above passed, then the user is able to be prompted
  // for feedback
  return true
}
