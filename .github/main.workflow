workflow "Reporting workflow" {
  resolves = ["high-priority-prs"]
  on = "schedule(1 0 * * *)"
}

action "high-priority-prs" {
  uses = "./.github/actions/high-priority-prs"
  secrets = [
    "GITHUB_TOKEN",
    "SLACK_TOKEN",
    "SLACK_CHANNEL_ID",
  ]
}
