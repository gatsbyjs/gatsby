import { prompt } from "enquirer"
import cmses from "./cmses.json"
import styles from "./styles.json"
import features from "./features.json"
import { initStarter } from "./init-starter"

const makeChoices = (
  options: Record<string, string>
): Array<{ message: string; name: string }> =>
  Object.entries(options).map(([name, message]) => {
    return { name, message }
  })

const questions = [
  {
    type: `input`,
    name: `project`,
    message: `What would you like to name the folder where you site will be created?`,
    initial: `my-gatsby-site`,
  },
  {
    type: `select`,
    name: `cms`,
    message: `Will you be using a CMS?`,
    hint: `Use arrow keys to move, and enter to select`,
    choices: makeChoices(cmses),
  },
  {
    type: `select`,
    name: `styling`,
    message: `Would you like to install a styling system?`,
    hint: `Use arrow keys to move, and enter to select`,
    choices: makeChoices(styles),
  },
  {
    type: `multiselect`,
    name: `features`,
    message: `Would you like to install additional features with other plugins?`,
    hint: `Use arrow keys to move, spacebar to select, and enter to confirm your choices`,
    choices: makeChoices(features),
  },
]

interface IAnswers {
  project: string
  styling?: keyof typeof styles
  cms?: keyof typeof cmses
  features?: Array<keyof typeof features>
}

export async function run(): Promise<void> {
  console.log(
    `Welcome to Gatsby! This command will generate a new Gatsby site for you with the setup you select. Let's answer some questions:`
  )
  const data = await prompt<IAnswers>(questions)

  const messages: Array<string> = [
    `🛠  Create a new Gatsby site in the folder "${data.project}"`,
  ]
  if (data.cms) {
    messages.push(`📚 Install and configure the plugin for ${cmses[data.cms]}`)
  }

  if (data.styling) {
    messages.push(
      `🎨 Get you set up to use ${styles[data.styling]} for styling your site`
    )
  }

  if (data.features) {
    messages.push(`🔌 Install ${data.features.join(`, `)}`)
  }

  console.log(`
Thanks! Here's what we'll now do:
${messages.join(`\n`)}
  `)

  const { confirm } = await prompt<{ confirm: boolean }>({
    type: `confirm`,
    choices: [`Yes`, `No`],
    name: `confirm`,
    message: `Shall we do this?`,
  })

  if (!confirm) {
    console.log(`OK, bye!`)
    process.exit(0)
  }

  await initStarter(
    `https://github.com/gatsbyjs/gatsby-starter-hello-world.git`,
    data.project
  )
  console.log(
    "Looks like you should probably go and implement `gatsby plugin add` now!"
  )
}
