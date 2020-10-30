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
  DOWN: `\x1B\x5B\x42`,
  UP: `\x1B\x5B\x41`,
  ENTER: `\x0D`,
  SPACE: `\x20`,
}

describe(`The create-gatsby CLI`, () => {
  it(`runs`, async () => {
    // Start mocking stdout
    stdout.start()
    run()
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
})
