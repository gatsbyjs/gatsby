import report from "gatsby-cli/lib/reporter"
import { getConfigStore, getGatsbyVersion } from "gatsby-core-utils"
import latestVersion from "latest-version"
import getDayOfYear from "date-fns/getDayOfYear"

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
    `\n\nHello! Will you help Gatsby improve by taking a four question survey?\nIt takes less than five minutes and your ideas and feedback will be very helpful.`
  )
  report.log(`\nGive us your feedback here: https://gatsby.dev/feedback\n\n`)
}

const randomChanceToBeTrue = (): boolean => {
  // This is spreading the request volume over the quarter.
  // We are grabbing a randomNumber within the spread of a first day
  // of a quarter, to the last day
  const currentQuarter = Math.floor((new Date().getMonth() + 3) / 3)
  const randomNumber = Math.floor(
    Math.random() *
      // One quarter year in days (roughly)
      (30 * 3)
  )
  const randomNumberWithinQuarter = randomNumber * currentQuarter

  return randomNumberWithinQuarter === getDayOfYear(new Date())
}

// We are only showing feedback requests to users in if they pass a few checks:
// 1. They pass a Math.random() check. This is a skateboard version of not sending out all requests in one day.
// 2. They haven't disabled the feedback mechanism
// 3. They don't have the environment variable to disable feedback present
// 4. It's been at least 3 months since the last feedback request
// 5. They are on the most recent version of Gatsby
export async function userPassesFeedbackRequestHeuristic(): Promise<boolean> {
  // Heuristic 1
  // We originally wrote this to have a single chance of hitting.
  // We wanted to up the chance by 5x, so this is our crude - temporary -
  // way of giving the user 5 chances to passing.
  const randomlyPassingHeuristic =
    randomChanceToBeTrue() ||
    randomChanceToBeTrue() ||
    randomChanceToBeTrue() ||
    randomChanceToBeTrue() ||
    randomChanceToBeTrue()

  if (!randomlyPassingHeuristic) {
    return false
  }

  // Heuristic 2
  if (getConfigStore().get(feedbackKey) === true) {
    return false
  }

  // Heuristic 3
  if (process.env.GATSBY_FEEDBACK_DISABLED === `1`) {
    return false
  }

  // Heuristic 4
  const lastDateValue = getConfigStore().get(lastDateKey)
  // 4.a if the user has never received the feedback request, this is undefined
  //     Which is effectively a pass, because it's been ~infinity~ since they last
  //     received a request from us.
  if (lastDateValue) {
    const lastDate = new Date(lastDateValue)
    const monthsSinceLastRequest = lastDate.getMonth() - new Date().getMonth()

    if (monthsSinceLastRequest < 3) {
      return false
    }
  }

  // Heuristic 5
  const versionPoints = getGatsbyVersion().split(`.`)
  let latestVersionPoints: string[] = []
  try {
    latestVersionPoints = (await latestVersion(`gatsby`)).split(`.`)
  } catch (e) {
    // do nothing.
    // if the request fails, then we should just not show the feedback request
    // because this in theory could happen often and we don't want to be spammy.
    // In this case, we are guaranteed to have `versionsMatchOnMajorAndMinor` === false
  }

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
