import { run, questions, validateProjectName, plugin } from "../"
import fs from "fs"
import { TextInput } from "../components/text"
import { SelectInput, MultiSelectInput } from "../components/select"
import path from "path"
import { assert } from "joi"
import Enquirer, { Prompt } from "enquirer"

// describe(`The create-gatsby CLI`, () => {
//   beforeEach(() => {
//     // clear stdout buffer
//     stdout.start()
//     run().catch(() => {})
//     spyOn(process, `exit`)
//   })

//   afterEach(() => {
//     stdout.stop()
//   })

//   it(`runs`, async () => {
//     await tick(1000)
//     stdinMock.send(`my-new-site`)
//     stdinMock.send(keys().ENTER)
//     await tick()
//     await stdinMock.send(keys().DOWN)
//     await stdinMock.send(keys().DOWN)
//     await stdinMock.send(keys().ENTER)
//     await tick()

//     await stdinMock.send(keys().DOWN)
//     await stdinMock.send(keys().ENTER)
//     await tick()

//     await stdinMock.send(keys().DOWN)
//     await stdinMock.send(keys().DOWN)
//     await stdinMock.send(keys().SPACE)
//     await stdinMock.send(keys().DOWN)
//     await stdinMock.send(keys().DOWN)
//     await stdinMock.send(keys().DOWN)
//     await stdinMock.send(keys().SPACE)
//     await stdinMock.send(keys().DOWN)
//     await stdinMock.send(keys().ENTER)
//     await tick()
//     await stdinMock.send(`tokenValue`)
//     await stdinMock.send(keys().DOWN)
//     await stdinMock.send(`spaceIdValue`)
//     await stdinMock.send(keys().ENTER)

//     // Clear the stdout buffer, as we only want to check final output
//     stdout.start()
//     await tick()

//     stdout.stop()

//     expect(stdout.output).toMatch(
//       `Create a new Gatsby site in the folder my-new-site`
//     )
//     expect(stdout.output).toMatch(
//       `Install and configure the plugin for Contentful`
//     )
//     expect(stdout.output).toMatch(
//       `Get you set up to use CSS Modules/PostCSS for styling your site`
//     )
//     expect(stdout.output).toMatch(
//       `Install gatsby-plugin-sitemap, gatsby-plugin-mdx`
//     )
//     stdout.start()

//     await stdinMock.send(`n`)
//     await tick()
//   })

//   it(`displays the plugin for the selected CMS to configure`, async () => {
//     await tick(1000)
//     stdinMock.send(`select-cms`)
//     stdinMock.send(keys().ENTER)
//     await tick()
//     await stdinMock.send(keys().DOWN) // WordPress is first in the list
//     await stdinMock.send(keys().ENTER)
//     await tick()
//     stdout.stop()
//     stdout.start()
//     await skipSteps(1)
//     await skipSelect()
//     await stdinMock.send(keys().ENTER)
//     await tick()
//     expect(stdout.output).toMatch(
//       `Install and configure the plugin for WordPress`
//     )
//     stdinMock.send(`n`)
//     await tick()
//   })

//   it(`displays the plugin for the selected styling solution`, async () => {
//     await tick(1000)
//     stdinMock.send(`select-styling`)
//     await skipSteps(2)
//     await stdinMock.send(keys().DOWN) // PostCSS is first in the list
//     await stdinMock.send(keys().ENTER)
//     await tick()
//     await skipSelect()
//     expect(stdout.output).toMatch(
//       `Get you set up to use CSS Modules/PostCSS for styling your site`
//     )
//     stdinMock.send(`n`)
//     await tick()
//   })

//   it(`doesnt print steps skipped by user`, async () => {
//     await tick(1000)
//     stdinMock.send(`skip-steps`)
//     await skipSteps()
//     await skipSelect()
//     // this should always be present
//     expect(stdout.output).toMatch(`Create a new Gatsby site in the folder`)
//     // these steps were skipped
//     expect(stdout.output).not.toMatch(`Install and configure the plugin for`)
//     expect(stdout.output).not.toMatch(`Get you set up to use`)

//     await stdinMock.send(`n`)

//     await tick()
//   })

// it(`complains if the destination folder exists`, async () => {
//   await tick(1000)
//   ;((fs.existsSync as unknown) as jest.Mock<
//     boolean,
//     [string]
//   >).mockReturnValueOnce(true)
//   await stdinMock.send(`exists`)
//   await stdinMock.send(keys().ENTER)
//   stdout.start()
//   ;((fs.existsSync as unknown) as jest.Mock<
//     boolean,
//     [string]
//   >).mockReturnValue(false)
//   await tick()
//   expect(stdout.output).toMatch(`The destination "exists" already exists`)
//   await skipSteps()
//   await skipSelect()
//   expect(stdout.output).toMatch(
//     `Create a new Gatsby site in the folder exists`
//   )
//   await stdinMock.send(`n`)
//   await tick()
// })

//   it(`complains if the destination name is invalid`, async () => {
//     await tick(1000)
//     stdout.stop()
//     stdout.start()
//     await stdinMock.send(`bad/name`)
//     await stdinMock.send(keys().ENTER)
//     await tick()
//     expect(stdout.output).toMatch(
//       `The destination "bad/name" is not a valid filename.`
//     )

//     await stdinMock.send(typeBackspace(8))
//     await tick()

//     await stdinMock.send(`goodname`)

//     await skipSteps()
//     await skipSelect()
//     expect(stdout.output).toMatch(
//       `Create a new Gatsby site in the folder goodname`
//     )
//   })

//   it.todo(`creates a new project/folder with a gatsby-config`)
// })

let enquirer

async function stringInput(prompt: any, word: string): Promise<void> {
  for (const char of word) {
    await prompt.keypress(char)
  }
}

describe(`run`, () => {
  beforeEach(() => {
    enquirer = new Enquirer<IAnswers>()
    enquirer.use(plugin)
  })

  // afterEach(() => {

  // })

  // it('should not accept bad name', async () => {
  //   enquirer.on('prompt', prompt => {
  //     prompt.once('run', async () => {
  //       await stringInput(prompt, 'bad/name')
  //       await prompt.submit()
  //       await prompt.keypress(null, {name: 'backspace'})
  //       await prompt.keypress(null, {name: 'backspace'})
  //       await prompt.keypress(null, {name: 'backspace'})
  //       await prompt.keypress(null, {name: 'backspace'})
  //       await prompt.keypress(null, {name: 'backspace'})
  //       await prompt.keypress(null, {name: 'backspace'})
  //       await prompt.keypress(null, {name: 'backspace'})
  //       await prompt.keypress(null, {name: 'backspace'})
  //       await stringInput(prompt, 'goodname')
  //       await prompt.submit()
  //       await prompt.submit()
  //       await prompt.keypress(null, {name: 'tab'})
  //       await prompt.submit()
  //     })
  //   })

  //   const data = await enquirer.prompt(questions)
  //   expect(data).toEqual({
  //     project: 'goodname',
  //     cms: 'gatsby-source-wordpress-experimental',
  //     styling: 'gatsby-plugin-postcss',
  //     features: []
  //   })
  // })

  // it('should error on existing name', async () => {
  //   ;((fs.existsSync as unknown) as jest.Mock<
  //     boolean,
  //     [string]
  //   >).mockReturnValueOnce(true)
  //   const result = await validateProjectName(`exists`)
  //   expect(result).toBe(`The destination "exists" already exists. Please choose a different name`)
  // })

  // it('should take project name', async () => {
  //   enquirer.on('prompt', prompt => {
  //     prompt.once('run', async () => {
  //       await stringInput(prompt, 'goodname')
  //       await prompt.submit()
  //       await prompt.submit()
  //       await prompt.keypress(null, {name: 'tab'})
  //       await prompt.submit()
  //     })
  //   })

  //   const data = await enquirer.prompt(questions)
  //   expect(data).toEqual({"cms": "gatsby-source-wordpress-experimental", "features": [], "project": "goodname", "styling": "gatsby-plugin-postcss"})
  // })

  // it('should take project name', async () => {
  //   enquirer.on('prompt', prompt => {
  //     prompt.once('run', async () => {
  //       await stringInput(prompt, 'my-new-site')
  //       await prompt.submit()
  //       await prompt.keypress(null, {name: 'down'})
  //       await prompt.keypress(null, {name: 'down'})
  //       await prompt.submit()
  //       await prompt.keypress(null, {name: 'down'})
  //       await prompt.submit()
  //       await prompt.keypress(null, {name: 'down'})
  //       await prompt.keypress(null, {name: 'space'})
  //       await prompt.keypress(null, {name: 'down'})
  //       await prompt.keypress(null, {name: 'down'})
  //       await prompt.keypress(null, {name: 'space'})
  //       await prompt.keypress(null, {name: 'tab'})
  //       await prompt.submit()
  //     })
  //   })

  //   const data = await enquirer.prompt(questions)
  //   console.log(data)
  //   expect(data).toEqual({"cms": "gatsby-source-contentful", "project": "my-new-site", "styling": "gatsby-plugin-postcss", "features": ["gatsby-plugin-react-helmet", "gatsby-plugin-offline"]})
  // })
})

// describe('test', () => {
//   let enquirer
//   beforeEach(() => {
//     enquirer = new Enquirer<IAnswers>()
//     enquirer.use(plugin)
//   })

//   it('can select a CMS', async () => {
//     enquirer.on('prompt', prompt => {
//       prompt.once('run', async () => {
//         await stringInput(prompt, 'my-new-site')
//         await prompt.keypress(null, {name: 'enter'})
//         await prompt.keypress(null, {name: 'down'})
//         // await prompt.keypress(null, {name: 'down'})
//         await prompt.keypress(null, {name: 'enter'})
//         await prompt.keypress(null, {name: 'enter'})
//         await prompt.keypress(null, {name: 'tab'})
//         await prompt.keypress(null, {name: 'enter'})
//       })
//     })

//     const data = await enquirer.prompt(questions)
//     console.log(data)
//     // expect(data).toEqual({"cms": "gatsby-source-wordpress-experimental", "features": [], "project": "goodname", "styling": "gatsby-plugin-postcss"})
//   })
// })
