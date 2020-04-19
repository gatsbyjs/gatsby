const diff = require(`jest-diff`).default
const chalk = require(`chalk`)

// console.log(process.env.NODE_ENV)
// if (process.env.NODE_ENV === `test`) {
// process.env.FORCE_COLOR = 0
// }

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
