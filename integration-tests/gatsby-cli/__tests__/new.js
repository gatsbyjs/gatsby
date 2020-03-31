import { invokeCli, removeFolder } from "../test-helpers"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

describe("gatsby new", () => {
  describe("default starter", () => {
    const siteName = "gatsby-default"

    afterAll(() => removeFolder(siteName))

    it("creates a gatsby site", () => {
      const [code, logs] = invokeCli("new", siteName)

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
  })

  describe("theme starter", () => {
    const siteName = "gatsby-blog"

    afterAll(() => removeFolder(siteName))

    it("creates a gatsby site", () => {
      const [code, logs] = invokeCli(
        "new",
        siteName,
        "gatsbyjs/gatsby-starter-blog"
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
  })

  describe("invalid starter", () => {
    const siteName = "gatsby-invalid"

    afterAll(() => removeFolder(siteName))

    it("fails to create a gatsby site", () => {
      let [code, logs] = invokeCli("new", siteName, "tHiS-Is-A-fAkE-sTaRtEr")

      logs.should.contain(`Error`)
      logs.should.contain(`starter tHiS-Is-A-fAkE-sTaRtEr doesn't exist`)

      expect(code).toBe(1)
    })
  })
})
