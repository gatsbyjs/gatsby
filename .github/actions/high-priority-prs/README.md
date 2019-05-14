# high-priority-prs action

Ported from @KyleAMathews [gatsby-pr-bot](https://github.com/KyleAMathews/gatsby-pr-bot/). [Read more about it on Kyle's blog](https://www.bricolage.io/bulding-a-slack-bot-to-help-handle-large-numbers-of-prs/)

Run locally [using act](https://github.com/nektos/act): `act -a "high-priority-prs"`

See below for the original README.

---

Sends Slack message every so often with important PRs to respond to.

This is an experimental effort to help with identifying the PRs that most need responses — initially breaking them up into two queues — one for those that have never seen a response from core maintainers and those that have had commits since the last comment so need a new review.

The goal is make sure every contributor has a great experience and to prevent valuable PRs from not getting in.

## Setup

`yarn install`

Change the slack channel ID to point to your own personal channel while experimenting (find that by [opening up slack in the web](https://gatsbyjs.slack.com) and copying the ID looking thing.

If testing changes, you can also write out the GitHub API response to a file called data.json and then change code in `process.js` to load
that file instead of waiting for API response from `index.js`. This speeds up iteration on design.

You can test the output by copy/pasting the CLI output to https://api.slack.com/tools/block-kit-builder
