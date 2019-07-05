import { danger, peril } from "danger"

// Trigger this rule to run in order to check a scheduled task immediately
// example config:
// "issue_comment.edited": ["rules/run-stale-immediately.ts"],
export default async () => {
  console.log("Running stale task in 1 second")
  await peril.runTask("stale", "in 1 second", {})
  console.log("Stale task finished")
}
