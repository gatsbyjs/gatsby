import { GatsbyCLI, removeFolder } from "../test-helpers"
import fs from "fs"
import { join } from "path"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

const cwd = `execution-folder`

describe(`gatsby new`, () => {
  // make folder for us to create sites into
  const dir = join(__dirname, "../execution-folder")
  beforeAll(() => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  })

  afterAll(() => removeFolder("execution-folder"))

  it(`a default starter creates a gatsby site`, () => {
    const [code, logs] = GatsbyCLI.from(cwd).invoke(`new`, `gatsby-default`)

    logs.should.contain(
      `info Creating new site from git: https://github.com/gatsbyjs/gatsby-starter-default.git`
    )
    logs.should.contain(`success Created starter directory layout`)
    logs.should.contain(`info Installing packages...`)
    logs.should.contain(`success Saved lockfile.`)
    logs.should.contain(
      `Your new Gatsby site has been successfully bootstrapped. Start developing it by running:`
    )
    logs.should.contain(`  cd gatsby-default`)
    logs.should.contain(`  gatsby develop`)
    expect(code).toBe(0)
  })

  it(`a theme starter creates a gatsby site`, () => {
    const [code, logs] = GatsbyCLI.from(cwd).invoke(
      `new`,
      `gatsby-blog`,
      `gatsbyjs/gatsby-starter-blog`
    )

    logs.should.contain(
      `info Creating new site from git: https://github.com/gatsbyjs/gatsby-starter-blog.git`
    )
    logs.should.contain(`success Created starter directory layout`)
    logs.should.contain(`info Installing packages...`)
    logs.should.contain(`success Saved lockfile.`)
    logs.should.contain(
      `Your new Gatsby site has been successfully bootstrapped. Start developing it by running:`
    )
    logs.should.contain(`  cd gatsby-blog`)
    logs.should.contain(`  gatsby develop`)
    expect(code).toBe(0)
  })

  it(`an invalid starter fails to create a gatsby site`, () => {
    const [code, logs] = GatsbyCLI.from(cwd).invoke(
      `new`,
      `gatsby-invalid`,
      `tHiS-Is-A-fAkE-sTaRtEr`
    )

    logs.should.contain(`Error`)
    logs.should.contain(`starter tHiS-Is-A-fAkE-sTaRtEr doesn't exist`)

    expect(code).toBe(1)
  })
})
