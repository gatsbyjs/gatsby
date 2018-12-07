const path = require(`path`)
const fs = require(`fs-extra`)

const envInfo = require(`../env-info.js`)

const mdCodeBlock = (content, lang) =>
  `
\`\`\`${lang}
${content}
\`\`\`
  `.trim()

module.exports = answers => {
  if (!answers.envinfoConfirmation && !answers.filesConfirmation) {
    return new Promise(resolve => resolve(``))
  }

  const promises = []

  if (answers.envinfoConfirmation) {
    promises.push(
      envInfo({ markdown: true }).then((result, error) =>
        `
<details>
<summary>Environment</summary>

${(result || error).toString().trim()}

</details>
        `.trim()
      )
    )
  }

  if (answers.filesConfirmation) {
    const files = [
      `gatsby-browser.js`,
      `gatsby-config.js`,
      `gatsby-node.js`,
      `gatsby-ssr.js`,
    ]

    files.forEach(fileName => {
      promises.push(
        fs
          .readFile(path.join(process.cwd(), fileName))
          .then((result, error) => {
            const content = result
              ? mdCodeBlock(result, `javascript`)
              : !error
              ? `Empty`
              : error.code === `ENOENT`
              ? `Non-existant`
              : error.toString()

            return `
<details>
<summary>${fileName}</summary>

${content}

</details>
            `.trim()
          })
      )
    })
  }

  return Promise.all(promises).then(results =>
    `
<!--
  The following data was automatically added by \`gatsby issue\`.
  Please do not modify or delete it, unless it contains sensitive information that you wish to remove.
-->

---

${results.join(`\n`)}
    `.trim()
  )
}
