import { run } from "../"
import { stdin } from "mock-stdin"
import { stdout } from "stdout-stderr"
const stdinMock = stdin()

jest.mock(`execa`)
jest.mock(`fs-extra`)

process.chdir = jest.fn()

const tick = (interval = 1): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, interval))

const Keys = {
  // pulled from https://tldp.org/LDP/abs/html/escapingsection.html
  DOWN: `\x1B\x5B\x42`,
  UP: `\x1B\x5B\x41`,
  ENTER: `\x0D`,
  SPACE: `\x20`,
}

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
    stdinMock.send(Keys.ENTER)
    await tick()
    await stdinMock.send(Keys.DOWN)
    await stdinMock.send(Keys.DOWN)
    await stdinMock.send(Keys.ENTER)
    await tick()

    await stdinMock.send(Keys.DOWN)
    await stdinMock.send(Keys.ENTER)
    await tick()

    await stdinMock.send(Keys.DOWN)
    await stdinMock.send(Keys.SPACE)
    await stdinMock.send(Keys.DOWN)
    await stdinMock.send(Keys.SPACE)
    stdinMock.send(Keys.ENTER)
    // Clear the stdout buffer, as we only want to check final output
    stdout.start()
    await tick()

    stdout.stop()
    console.log(stdout.output)

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
    await tick(1000)
  })

  it(`displays the plugin for the selected CMS to configure`, async () => {
    await tick()
    stdinMock.send(`select-cms`)
    stdinMock.send(Keys.ENTER)
    await tick()
    await stdinMock.send(Keys.DOWN) // WordPress is first in the list
    await stdinMock.send(Keys.ENTER)
    await tick()
    stdout.stop()

    expect(stdout.output).toMatch(`gatsby-source-wordpress`)
    await tick(1000)
  })

  it(`displays the plugin for the selected styling solution`, async () => {
    await tick()
    stdinMock.send(`select-styling`)
    stdinMock.send(Keys.ENTER)
    await tick()
    await stdinMock.send(Keys.ENTER)
    await tick()
    await stdinMock.send(Keys.DOWN) // PostCSS is first in the list
    await stdinMock.send(Keys.ENTER)
    await tick()
    stdout.stop()

    expect(stdout.output).toMatch(`gatsby-plugin-postcss`)
    await tick(1000)
  })

  it(`doesnt print steps skipped by user`, async () => {
    await tick()
    stdinMock.send(`skip-steps`)
    stdinMock.send(Keys.ENTER) // skip name
    await tick()
    await stdinMock.send(Keys.ENTER) // skip cms step
    await tick()
    await stdinMock.send(Keys.ENTER) // skip styling
    await tick()
    await stdinMock.send(Keys.ENTER) // skip features
    // Clear the stdout buffer, as we only want to check final output
    stdout.start()
    await tick()
    stdout.stop()

    // this should always be present
    expect(stdout.output).toMatch(`Create a new Gatsby site in the folder`)
    // these steps were skipped
    expect(stdout.output).not.toMatch(`Install and configure the plugin for`)
    expect(stdout.output).not.toMatch(`Get you set up to use`)
    await tick(1000)
  })

  it.todo(`creates a new project/folder with a gatsby-config`)
})
