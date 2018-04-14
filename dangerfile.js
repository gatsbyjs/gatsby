import { message, danger } from "danger"

const messageText =   `
Gatsby requires contributors to sign each commit.

You can do this for your branch with \`git rebase --signoff\`, or for a single commit with \`git commit --amend -s\`.

Check out the [Developer Certificate of Origin docs](https://www.gatsbyjs.org/docs/how-to-contribute/#developer-certificate-of-origin) or comment here if you've any questions.
`

const unsignedMessages = danger.github.commits
  .map(c => c.commit.message)
  .filter(msg => !msg.includes(`Signed-off-by:`))

if (unsignedMessages.length > 0) message(messageText)
