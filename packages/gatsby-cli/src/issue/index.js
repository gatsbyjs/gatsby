const inquirer = require(`inquirer`)
const newGithubIssueUrl = require(`new-github-issue-url`)
const opn = require(`opn`)

const issueTypes = require(`./issue-types`)
const telemetry = require(`./telemetry`)

const issueTypeQuestion = {
  type: `list`,
  name: `issueType`,
  message: `Do you want to open a Bug Report, Feature Request, or Question?`,
  choices: Object.entries(issueTypes).map(([value, { prettyName: name }]) => {
    return { value, name }
  }),
}

module.exports = () => {
  inquirer.prompt(issueTypeQuestion).then(({ issueType }) => {
    inquirer.prompt(issueTypes[issueType].questions).then(async answers => {
      const body =
        issueTypes[issueType].template(answers).trim() +
        `\n\n` +
        (await telemetry(answers))

      const url = newGithubIssueUrl({
        user: `gatsbyjs`,
        repo: `gatsby`,
        body,
      })

      opn(url)
      console.info(
        `
✔️ All done! We opened a page in your browser where you can provide furher details and submit your issue.
🔗 If your browser wasn't launched, please open the following URL manually:

${url}
          `.trim()
      )
    })
  })
}
