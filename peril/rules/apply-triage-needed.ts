import { danger, GitHubIssueLabel } from "danger"

interface ApiError {
  action: string
  opts: object
  error: any
}

export const logApiError = ({ action, opts, error }: ApiError) => {
  const msg = `Could not run ${action} with options ${JSON.stringify(
    opts
  )}\n Error was ${error}\nSet env var DEBUG=octokit:rest* for extended logging info.`
  console.warn(msg)
}

const triageNeededLabel = "status: triage needed"

export const applyStatusTriageNeededLabel = async () => {
  const gh = danger.github as any

  // both PRs and issues have `number` and `labels`
  const issueOrPullRequest = gh.pr || gh.issue

  // gh.repository is available for new issues
  // gh.pr.base.repo is available for new PRs
  const repo = gh.repository || (gh.pr && gh.pr.base && gh.pr.base.repo)

  if (!repo) {
    console.warn(`Couldn't find repository from webhook`, gh)
  }

  try {
    if (
      issueOrPullRequest &&
      !issueOrPullRequest.labels.some(
        (label: GitHubIssueLabel) => label.name === triageNeededLabel
      )
    ) {
      const opts = {
        owner: repo.owner.login,
        repo: repo.name,
        number: issueOrPullRequest.number,
        labels: [triageNeededLabel],
      }

      try {
        await danger.github.api.issues.addLabels(opts)
      } catch (error) {
        logApiError({ action: `issues.addLabel`, opts, error })
      }
    }
  } catch (e) {
    console.log(e)
  }
}

export default async () => {
  await applyStatusTriageNeededLabel()
}
