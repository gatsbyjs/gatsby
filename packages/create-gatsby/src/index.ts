import { prompt } from "enquirer"
import cmses from "./cmses.json"
import styles from "./styles.json"
import features from "./features.json"
import { initStarter } from "./init-starter"
import c from "ansi-colors"

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
    message: `What would you like to name the folder where your site will be created?`,
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
    `


                         ${c.blueBright.bold.underline(`Welcome to Gatsby!`)}
   
                
`
  )

  console.log(
    c.red.italic(`Important: This is currently for testing purposes only`)
  )
  console.log(
    `This command will generate a new Gatsby site for you with the setup you select.`
  )
  console.log(`Let's answer some questions:\n`)
  const data = await prompt<IAnswers>(questions)

  const messages: Array<string> = [
    `🛠  Create a new Gatsby site in the folder ${c.blueBright(data.project)}`,
  ]
  if (data.cms && data.cms !== `none`) {
    messages.push(
      `📚 Install and configure the plugin for ${c.red(cmses[data.cms])}`
    )
  }

  if (data.styling && data.styling !== `none`) {
    messages.push(
      `🎨 Get you set up to use ${c.green(
        styles[data.styling]
      )} for styling your site`
    )
  }

  if (data.features?.length) {
    messages.push(
      `🔌 Install ${data.features.map(feat => c.magenta(feat)).join(`, `)}`
    )
  }

  console.log(`

${c.bold(`Thanks! Here's what we'll now do:`)}

    ${messages.join(`\n    `)}
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
    `This is the point where we'd then install the plugins, but ${c.redBright(
      `gatsby plugin add`
    )} hasn't been implemented yet`
  )
}
