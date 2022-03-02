import execa, { sync } from "execa"
import { resolve } from "path"
import { readdirSync, readFileSync } from "fs"

const cli = resolve(`node_modules/gatsby-cli/cli.js`)
const options = {
  env: {
    ...process.env,
    GATSBY_EXPERIMENTAL_LISTEN_FOR_SEGFAULTS: true,
  },
}

jest.setTimeout(30000)

describe(`build process`, () => {
  beforeAll(() => {
    sync(`node`, [cli, `clean`]), options
  })

  it(`should print a stack trace to stderr`, done => {
    const build = execa(`node`, [cli, `build`], options)

    let stderr = ``
    build.stderr.on(`data`, data => {
      stderr += data.toString()
    })

    build.on(`exit`, () => {
      expect(stderr).toEqual(
        expect.stringContaining(`received SIGSEGV for address`)
      )
      expect(stderr).toEqual(expect.stringContaining(`segfault-handler.node`))
      done()
    })
  })

  it(`should write a log file to .cache/logs`, done => {
    const build = execa(`node`, [cli, `build`], options)

    build.on(`exit`, () => {
      const [log] = readdirSync(resolve(`.cache/logs`))
      expect(log).toEqual(expect.stringContaining(`gatsby-segfault`))

      const contents = readFileSync(resolve(`.cache/logs/${log}`)).toString()
      expect(contents).toEqual(
        expect.stringContaining(`received SIGSEGV for address`)
      )
      expect(contents).toEqual(expect.stringContaining(`segfault-handler.node`))
      done()
    })
  })
})
