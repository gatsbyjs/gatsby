workflow "Reporting workflow" {
  resolves = ["high-priority-prs"]
  on = "schedule(1 0 * * 1,2,3,4,5)"
}

action "high-priority-prs" {
  uses = "./.github/actions/high-priority-prs"
  secrets = [
    "GITHUB_TOKEN",
    "SLACK_TOKEN",
    "SLACK_CHANNEL_ID",
    "SLACK_CORE_CHANNEL_ID",
    "SLACK_LEARNING_CHANNEL_ID",
  ]
}

workflow "Site Showcase Validator workflow" {
  resolves = ["gatsby-site-showcase-validator"]
  on = "schedule(0 0 * * *)"
}

action "gatsby-site-showcase-validator" {
  uses = "./.github/actions/gatsby-site-showcase-validator"
  secrets = ["SLACK_TOKEN", "SLACK_CHANNEL_ID", "GITHUB_TOKEN"]
}
