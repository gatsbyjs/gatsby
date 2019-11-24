const fs = require(`fs`)

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function makeProgressIssue() {
  const text = fs.readFileSync(`./PROGRESS.template.md`, `utf-8`)
  const issues = JSON.parse(fs.readFileSync(`./pages.json`))

  const issuesText = issues
    .map(({ name, pages }) => {
      // TODO query to find out if the pages are translated yet
      const pagesText = pages.map(p => `* [ ] ${name}/${p}`).join(`\n`)
      return `
### ${capitalize(name)}

${pagesText}
    `
    })
    .join(`\n`)

  return `
${text}

${issuesText}
`
}

module.exports = {
  makeProgressIssue,
}
