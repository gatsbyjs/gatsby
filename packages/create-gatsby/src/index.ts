import { prompt } from "enquirer"
import questions from "./questions.json"
import { initStarter } from "./init-starter"

interface IAnswers {
  project: string
  styling?: string
  cms?: string
}

export async function run(): Promise<void> {
  console.log(`Welcome to Gatsby! Let's answer some questions`)
  const data = await prompt<IAnswers>(questions)

  const messages: Array<string> = [
    `🛠  Create a new Gatsby site called ${data.project}`,
  ]
  if (data.cms) {
    messages.push(`📚 Install and configure the plugin for ${data.cms}`)
  }

  if (data.styling) {
    messages.push(
      `🎨 Get you set up to use ${data.styling} for styling your site`
    )
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
