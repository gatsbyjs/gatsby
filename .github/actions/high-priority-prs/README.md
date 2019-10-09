# high-priority-prs action

## Description

Sends Slack messages [scheduled by GitHub actions](https://developer.github.com/actions/managing-workflows/workflow-configuration-options/#example-scheduled-workflow-block) with important PRs to respond to.

This is an experimental effort to help with identifying the PRs that most need responses — initially breaking them up into three queues, those that have:

— never seen a response from core maintainers

- had commits since the last comment so need a new review
- not been updated for at least 30 days

The goal is make sure every contributor has a great experience and to prevent valuable PRs from going stale.

Ported from @KyleAMathews gatsby-pr-bot. [Read more about it on Kyle's blog](https://www.bricolage.io/bulding-a-slack-bot-to-help-handle-large-numbers-of-prs/)

## How it works

Data is queried from GitHub and then filtered down to sort out information like whether or not maintainers have commented/reviewed
a PR or not.

The processed data is filtered down and sent out to teams that have been requested as reviewers (which is automated by the [CODEOWNERS](../../../CODEOWNERS) file),
except for the Core team which receives a list from all open PRs.

## Testing locally

Run using [act](https://github.com/nektos/act): `act -a "high-priority-prs"`

You'll be prompted to enter in the required tokens (GitHub will use the tokens saved from the UI), you can
[generate your own Slack token](https://api.slack.com/custom-integrations/legacy-tokens) as well as [your own GitHub token](), for GitHub be sure to
add permissions when generating for `repo`, `read:org`, and `read:discussion`, you can enter the ID of your personal slack channel to send direct messages
to yourself while testing.

## Setup

`yarn install`

Change the slack channel ID to point to your own personal channel while experimenting (find that by [opening up slack in the web](https://gatsbyjs.slack.com) and copying the ID looking thing.

If testing changes, you can also write out the GitHub API response to a file called data.json and then change code in `process-data.js` to load
that file instead of waiting for API response from `index.js`. This speeds up iteration on design.

You can test the output by copy/pasting the CLI output to https://api.slack.com/tools/block-kit-builder
