import report from "gatsby-cli/lib/reporter"
import Configstore from "configstore"
import latestVersion from "latest-version"
import path from "path"

const latestGatsbyVersion = latestVersion(`gatsby`)

const config = new Configstore(
  `gatsby`,
  {},
  {
    globalConfigPath: true,
  }
)

const feedbackKey = `feedback.disabled`
const lastDateKey = `feedback.lastRequestDate`

export function setFeedbackDisabledValue(enabled: boolean) {
  config.set(feedbackKey, enabled)
}

export function showFeedbackRequest(): void {
  config.set(lastDateKey, Date.now())
  report.log(
    `Hello! Will you help Gatsby improve by taking a four question survey?`
  )
  report.log(`Give us your feedback here: https://www.typeform.com/to/A9VWwT`)
}

// We are only showing feedback requests to users in if they pass a few checks:
// 1. They haven't disabled the feedback mechanism
// 2. They don't have the environment variable to disable feedback present
// 3. It's been at least 3 months since the last feedback request
// 4. They are on the most recent version of Gatsby
export async function userPassesFeedbackRequestHeuristic(): Promise<boolean> {
  //   // 1
  //   if (config.get(feedbackKey) === true) return false

  //   // 2
  //   if (process.env[feedbackKey] === `1`) return false

  //   // 3
  //   const lastDateValue = config.get(lastDateKey)
  //   // 3.a if the user has never received the feedback request, this is undefined
  //   //     Which is effectively a pass, because it's been ~infinity~ since they last
  //   //     received a request from us.
  //   if (lastDateValue) {
  //     const lastDate = new Date()
  //     const monthsSinceLastRequest = lastDate.getMonth() - new Date().getMonth()

  //     if (monthsSinceLastRequest < 3) return false
  //   }

  // 4.
  try {
    const { version } = require(path.join(
      process.cwd(),
      `node_modules`,
      `gatsby`,
      `package.json`
    ))

    const latest = await latestGatsbyVersion
    console.log(version, latest)
  } catch (e) {
    console.log(">???")
    return false
  }
  return true
}
