import { run } from "../"
import { stdin } from "mock-stdin"
import { stdout } from "stdout-stderr"

const stdinMock = stdin()
// stdout.print = true
jest.mock(`execa`)
jest.mock(`fs-extra`)
jest.mock(`fs`)

import fs from "fs"

process.chdir = jest.fn()

const tick = (interval = 1): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, interval))

const keys = (): {
  DOWN: string
  UP: string
  ENTER: string
  SPACE: string
  BACKSPACE: string
} => {
  const platform = process.platform

  switch (platform) {
    case `linux`:
      return {
        DOWN: `\x1B\x5B\x42`,
        UP: `\x1B\x5B\x41`,
        ENTER: `\n`,
        SPACE: `\x20`,
        BACKSPACE: `\x7F`,
      }
    case `win32`:
      return {
        DOWN: `\x1B\x5B\x42`,
        UP: `\x1B\x5B\x41`,
        ENTER: `\r\n`,
        SPACE: `\x20`,
        BACKSPACE: `\x08`,
      }
    default:
      // pulled from https://tldp.org/LDP/abs/html/escapingsection.html
      return {
        DOWN: `\x1B\x5B\x42`,
        UP: `\x1B\x5B\x41`,
        ENTER: `\r`,
        SPACE: `\x20`,
        BACKSPACE: `\x7F`,
      }
  }
}

async function skipSteps(count = 3): Promise<void> {
  for (let i = 0; i < count - 1; i++) {
    await stdinMock.send(keys().ENTER)
    await tick()
  }
  await stdinMock.send(keys().ENTER)
  await tick()
}

async function skipSelect(): Promise<void> {
  await stdinMock.send(keys().DOWN)
  await stdinMock.send(keys().DOWN)
  await stdinMock.send(keys().DOWN)
  await stdinMock.send(keys().DOWN)
  await stdinMock.send(keys().DOWN)
  await stdinMock.send(keys().DOWN)
  await stdinMock.send(keys().ENTER)
  await tick()
}

const typeBackspace = (count: number): string => keys().BACKSPACE.repeat(count)

describe(`The create-gatsby CLI`, () => {
  beforeEach(() => {
    // clear stdout buffer
    stdout.start()
    run().catch(() => {})
    spyOn(process, `exit`)
  })

  afterEach(() => {
    stdout.stop()
  })

  it(`runs`, async () => {
    await tick()
    stdinMock.send(`my-new-site`)
    stdinMock.send(keys().ENTER)
    await tick()
    await stdinMock.send(keys().DOWN)
    await stdinMock.send(keys().DOWN)
    await stdinMock.send(keys().ENTER)
    await tick()

    await stdinMock.send(keys().DOWN)
    await stdinMock.send(keys().ENTER)
    await tick()

    await stdinMock.send(keys().DOWN)
    await stdinMock.send(keys().DOWN)
    await stdinMock.send(keys().SPACE)
    await stdinMock.send(keys().DOWN)
    await stdinMock.send(keys().DOWN)
    await stdinMock.send(keys().DOWN)
    await stdinMock.send(keys().SPACE)
    await stdinMock.send(keys().DOWN)
    await stdinMock.send(keys().ENTER)
    await tick()
    await stdinMock.send(`tokenValue`)
    await stdinMock.send(keys().DOWN)
    await stdinMock.send(`spaceIdValue`)
    await stdinMock.send(keys().ENTER)

    // Clear the stdout buffer, as we only want to check final output
    stdout.start()
    await tick()

    stdout.stop()

    expect(stdout.output).toMatch(
      `Create a new Gatsby site in the folder my-new-site`
    )
    expect(stdout.output).toMatch(
      `Install and configure the plugin for Contentful`
    )
    expect(stdout.output).toMatch(
      `Get you set up to use CSS Modules/PostCSS for styling your site`
    )
    expect(stdout.output).toMatch(
      `Install gatsby-plugin-sitemap, gatsby-plugin-mdx`
    )
    stdout.start()

    await stdinMock.send(`n`)
    await tick()
  })

  it(`displays the plugin for the selected CMS to configure`, async () => {
    await tick()
    stdinMock.send(`select-cms`)
    stdinMock.send(keys().ENTER)
    await tick()
    await stdinMock.send(keys().DOWN) // WordPress is first in the list
    await stdinMock.send(keys().ENTER)
    await tick()
    stdout.stop()
    stdout.start()
    await skipSteps(1)
    await skipSelect()
    expect(stdout.output).toMatch(
      `Install and configure the plugin for WordPress`
    )
    stdinMock.send(keys().ENTER)
    await tick()
  })

  it(`displays the plugin for the selected styling solution`, async () => {
    await tick()
    stdinMock.send(`select-styling`)
    await skipSteps(2)
    await stdinMock.send(keys().DOWN) // PostCSS is first in the list
    await stdinMock.send(keys().ENTER)
    await tick()
    await skipSelect()
    expect(stdout.output).toMatch(
      `Get you set up to use CSS Modules/PostCSS for styling your site`
    )
    stdinMock.send(keys().ENTER)
    await tick()
  })

  it(`doesnt print steps skipped by user`, async () => {
    await tick()
    stdinMock.send(`skip-steps`)
    await skipSteps()
    await skipSelect()
    // this should always be present
    expect(stdout.output).toMatch(`Create a new Gatsby site in the folder`)
    // these steps were skipped
    expect(stdout.output).not.toMatch(`Install and configure the plugin for`)
    expect(stdout.output).not.toMatch(`Get you set up to use`)

    await stdinMock.send(`n`)

    await tick()
  })

  it(`complains if the destination folder exists`, async () => {
    ;((fs.existsSync as unknown) as jest.Mock<
      boolean,
      [string]
    >).mockReturnValueOnce(true)
    await stdinMock.send(`exists`)
    await stdinMock.send(keys().ENTER)
    stdout.start()
    ;((fs.existsSync as unknown) as jest.Mock<
      boolean,
      [string]
    >).mockReturnValue(false)
    await tick()
    expect(stdout.output).toMatch(`The destination "exists" already exists`)
    await skipSteps()
    await skipSelect()
    expect(stdout.output).toMatch(
      `Create a new Gatsby site in the folder exists`
    )
    await stdinMock.send(keys().ENTER)
    await tick()
  })

  it(`complains if the destination name is invalid`, async () => {
    await tick()
    stdout.stop()
    stdout.start()
    await stdinMock.send(`bad/name`)
    await stdinMock.send(keys().ENTER)
    await tick()
    expect(stdout.output).toMatch(
      `The destination "bad/name" is not a valid filename.`
    )

    await stdinMock.send(typeBackspace(8))
    await tick()

    await stdinMock.send(`goodname`)

    await skipSteps()
    await skipSelect()
    expect(stdout.output).toMatch(
      `Create a new Gatsby site in the folder goodname`
    )
  })

  it.todo(`creates a new project/folder with a gatsby-config`)
})
