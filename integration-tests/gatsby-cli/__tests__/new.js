import { GatsbyCLI } from "../test-helpers"
import * as fs from "fs-extra"
import execa from "execa"
import { join } from "path"
import { getConfigStore } from "gatsby-core-utils"

const MAX_TIMEOUT = 30000
jest.setTimeout(MAX_TIMEOUT)

const cwd = `execution-folder`

const clean = dir => execa(`yarn`, ["del-cli", dir])

describe(`gatsby new`, () => {
  // make folder for us to create sites into
  const dir = join(__dirname, "../execution-folder")
  const originalPackageManager =
    getConfigStore().get("cli.packageManager") || `npm`

  beforeAll(async () => {
    await clean(dir)
    await fs.ensureDir(dir)
    GatsbyCLI.from(cwd).invoke([`options`, `set`, `pm`, `yarn`])
  })

  afterAll(async () => {
    GatsbyCLI.from(cwd).invoke([`options`, `set`, `pm`, originalPackageManager])
    await clean(dir)
  })

  it(`creates a gatsby site with the default starter`, () => {
    const [code, logs] = GatsbyCLI.from(cwd).invoke([`new`, `gatsby-default`])

    logs.should.contain(
      `info Creating new site from git: https://github.com/gatsbyjs/gatsby-starter-default.git`
    )
    logs.should.contain(`success Created starter directory layout`)
    logs.should.contain(`info Installing packages...`)
    logs.should.contain(
      `Your new Gatsby site has been successfully bootstrapped. Start developing it by running:`
    )
    logs.should.contain(`  cd gatsby-default`)
    logs.should.contain(`  gatsby develop`)
    expect(code).toBe(0)
  })

  it(`creates a gatsby site with the blog starter`, () => {
    const [code, logs] = GatsbyCLI.from(cwd).invoke([
      `new`,
      `gatsby-blog`,
      `gatsbyjs/gatsby-starter-blog`,
    ])

    logs.should.contain(
      `info Creating new site from git: https://github.com/gatsbyjs/gatsby-starter-blog.git`
    )
    logs.should.contain(`success Created starter directory layout`)
    logs.should.contain(`info Installing packages...`)
    logs.should.contain(
      `Your new Gatsby site has been successfully bootstrapped. Start developing it by running:`
    )
    logs.should.contain(`  cd gatsby-blog`)
    logs.should.contain(`  gatsby develop`)
    expect(code).toBe(0)
  })

  it(`fails to create a gatsby site with an invalid starter`, () => {
    const [code, logs] = GatsbyCLI.from(cwd).invoke([
      `new`,
      `gatsby-invalid`,
      `tHiS-Is-A-fAkE-sTaRtEr`,
    ])

    logs.should.contain(`Error`)
    logs.should.contain(`starter tHiS-Is-A-fAkE-sTaRtEr doesn't exist`)

    expect(code).toBe(1)
  })

  it(`runs create-gatsby when no arguments are provided to gatsby new`, () => {
    const [_, logs] = GatsbyCLI.from(cwd).invoke([`new`])

    logs.should.contain(`Welcome to Gatsby!`)
  })
})
