import diff from "jest-diff"
import chalk from "chalk"
import stripAnsi from "strip-ansi"

export default function getDiff(oldVal, newVal) {
  const options = {
    aAnnotation: `Original`,
    bAnnotation: `Modified`,
    aColor: chalk.red,
    bColor: chalk.green,
    includeChangeCounts: true,
    contextLines: 3,
    expand: false,
  }

  let diffText = diff(oldVal, newVal, options)

  if (process.env.GATSBY_RECIPES_NO_COLOR) {
    diffText = stripAnsi(diffText)
  }

  return diffText
}
