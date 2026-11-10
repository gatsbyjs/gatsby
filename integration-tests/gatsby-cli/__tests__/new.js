import { GatsbyCLI } from "../test-helpers"
import * as fs from "fs-extra"
import { join } from "path"
import { getConfigStore } from "gatsby-core-utils"

const MAX_TIMEOUT = 30000
jest.setTimeout(MAX_TIMEOUT)

const cwd = `execution-folder`

const clean = async dir => {
  try {
    await fs.rmdir(dir, { recursive: true })
  } catch {
    // will throw when dir doesn't exist
    // which is fine, we just want to ensure it's clean
  }
}

describe(`gatsby new`, () => {
  // make folder for us to create sites into
  const dir = join(__dirname, "../execution-folder")
  const blogStarter = join(dir, `blog-starter`)
  const originalPackageManager =
    getConfigStore().get("cli.packageManager") || `npm`

  beforeAll(async () => {
    await clean(dir)
    await fs.ensureDir(dir)
    const sourceRoot =
      process.env.CIRCLE_WORKING_DIRECTORY || join(__dirname, `../../..`)
    await fs.copy(join(sourceRoot, `starters/blog`), blogStarter)
    const blogPackagePath = join(blogStarter, `package.json`)
    const blogPackage = await fs.readJSON(blogPackagePath)
    const transformerRemark = await fs.readJSON(
      join(sourceRoot, `packages/gatsby-transformer-remark/package.json`)
    )
    blogPackage.resolutions = {
      ...blogPackage.resolutions,
      "sanitize-html": transformerRemark.dependencies[`sanitize-html`],
    }
    await fs.writeJSON(blogPackagePath, blogPackage, { spaces: 2 })
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

  it(`creates a gatsby site with a local blog starter`, () => {
    const [code, logs] = GatsbyCLI.from(cwd).invoke([
      `new`,
      `gatsby-blog`,
      blogStarter,
    ])

    logs.should.contain(
      `info Creating new site from local starter: ${blogStarter}`
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
