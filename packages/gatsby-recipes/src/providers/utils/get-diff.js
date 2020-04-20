const diff = require(`jest-diff`).default
const chalk = require(`chalk`)

module.exports = async (oldVal, newVal) => {
  const options = {
    aAnnotation: `Original`,
    bAnnotation: `Modified`,
    aColor: chalk.red,
    bColor: chalk.green,
    includeChangeCounts: true,
    contextLines: 3,
    expand: false,
  }

  const diffText = diff(oldVal, newVal, options)

  return diffText
}
