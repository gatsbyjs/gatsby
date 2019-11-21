import { danger } from "danger"
import { IssueComment } from "github-webhook-event-types"

export const STALE_LABEL = `stale?`

export const notStale = async () => {
  const gh = (danger.github as any) as IssueComment
  const repo = gh.repository
  const labels = gh.issue.labels.map(i => i.name)
  const opts = {
    owner: repo.owner.login,
    repo: repo.name,
    number: gh.issue.number,
    name: encodeURIComponent(STALE_LABEL),
  } as any

  if (labels.includes(STALE_LABEL)) {
    try {
      await danger.github.api.issues.removeLabel(opts)
    } catch (error) {
      console.log(
        `Could not run issues.removeLabel with options: ${JSON.stringify(opts)}`
      )
      console.log(error)
    }
  }
}

export default async () => {
  await notStale()
}
