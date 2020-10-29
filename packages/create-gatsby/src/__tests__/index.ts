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
    run()
    await tick()
    stdinMock.send(Keys.ENTER)
    await tick()
    await stdinMock.send(Keys.DOWN)
    await stdinMock.send(Keys.DOWN)
    await stdinMock.send(Keys.ENTER)
    await tick()

    stdinMock.send(Keys.ENTER)
    await tick()
    await stdinMock.send(Keys.DOWN)
    await stdinMock.send(Keys.SPACE)
    await stdinMock.send(Keys.DOWN)
    await stdinMock.send(Keys.SPACE)
    stdinMock.send(Keys.ENTER)
    stdout.start()
    await tick()

    expect(stdout.output).toMatchInlineSnapshot(`
      "✔ Would you like to install additional features with other plugins? · gatsby-plugin-sitemap, gatsby-plugin-mdx✔ Would you like to install additional features with other plugins? · gatsby-plugin-sitemap, gatsby-plugin-mdx✔ Would you like to install additional features with other plugins? · gatsby-plugin-sitemap, gatsby-plugin-mdx✔ Would you like to install additional features with other plugins? · gatsby-plugin-sitemap, gatsby-plugin-mdx✔ Would you like to install additional features with other plugins? · gatsby-plugin-sitemap, gatsby-plugin-mdx


      Thanks! Here's what we'll now do:

          🛠  Create a new Gatsby site in the folder my-gatsby-site
          📚 Install and configure the plugin for Contentful
          🎨 Get you set up to use  for styling your site
          🔌 Install gatsby-plugin-sitemap, gatsby-plugin-mdx
        
      ? Shall we do this? (y/N) › false"
    `)
    stdout.stop()

    await tick(1000)
  })
})
