import fs from "fs"
import path from "path"
import languages from "../questions/languages.json"
import cmses from "../questions/cmses.json"
import styles from "../questions/styles.json"
import features from "../questions/features.json"
import colors from "ansi-colors"
import { reporter } from "./reporter"
import { IFlags } from "./parse-args"

// eslint-disable-next-line no-control-regex
const INVALID_FILENAMES = /[<>:"/\\|?*\u0000-\u001F]/g
const INVALID_WINDOWS = /^(con|prn|aux|nul|com\d|lpt\d)$/i

export const makeChoices = (
  options: Record<string, { message: string; dependencies?: Array<string> }>,
  mustSelect = false
): Array<{ message: string; name: string; disabled?: boolean }> => {
  const entries = Object.entries(options).map(([name, message]) => {
    return { name, message: message.message }
  })

  if (mustSelect) {
    return entries
  }

  const none = { name: `none`, message: `No (or I'll add it later)` }
  const divider = { name: `–`, role: `separator`, message: `–` }

  return [none, divider, ...entries]
}

export function validateProjectName(value: string): boolean {
  if (!value) {
    reporter.warn(
      `You have not provided a directory name for your site. Please do so when running with the 'y' flag.`
    )
    return false
  }
  value = value.trim()
  if (INVALID_FILENAMES.test(value)) {
    reporter.warn(
      `The destination "${value}" is not a valid filename. Please try again, avoiding special characters.`
    )
    return false
  }
  if (process.platform === `win32` && INVALID_WINDOWS.test(value)) {
    reporter.warn(
      `The destination "${value}" is not a valid Windows filename. Please try another name`
    )
    return false
  }
  if (fs.existsSync(path.resolve(value))) {
    reporter.warn(
      `The destination "${value}" already exists. Please choose a different name`
    )
    return false
  }
  return true
}

// Enquirer types are not exported and are out of date
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateQuestions = (
  initialFolderName: string,
  flags: IFlags
): any => {
  const siteNameQuestion = {
    type: `textinput`,
    name: `project`,
    message: `What would you like to name the folder where your site will be created?`,
    hint: path.basename(process.cwd()),
    separator: `/`,
    initial: initialFolderName,
    format: (value: string): string => colors.cyan(value),
    validate: validateProjectName,
    skip: flags.yes,
  }

  const languageQuestion = {
    type: `selectinput`,
    name: `language`,
    message: `Will you be using JavaScript or TypeScript?`,
    hint: `(Single choice) Arrow keys to move, enter to confirm`,
    choices: makeChoices(languages, true),
  }

  const otherQuestions = [
    {
      type: `selectinput`,
      name: `cms`,
      message: `Will you be using a CMS?`,
      hint: `(Single choice) Arrow keys to move, enter to confirm`,
      choices: makeChoices(cmses),
    },
    {
      type: `selectinput`,
      name: `styling`,
      message: `Would you like to install a styling system?`,
      hint: `(Single choice) Arrow keys to move, enter to confirm`,
      choices: makeChoices(styles),
    },
    {
      type: `multiselectinput`,
      name: `features`,
      message: `Would you like to install additional features with other plugins?`,
      hint: `(Multiple choice) Use arrow keys to move, spacebar to select, and confirm with an enter on "Done"`,
      choices: makeChoices(features, true),
    },
  ]

  // Skip all questions
  if (flags.yes) {
    return siteNameQuestion
  }

  // Skip language question
  if (flags.ts) {
    return [siteNameQuestion, ...otherQuestions]
  }

  return [siteNameQuestion, languageQuestion, ...otherQuestions]
}
