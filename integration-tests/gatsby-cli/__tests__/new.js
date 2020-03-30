import { invokeCli, removeFolder } from "../test-helpers"

const MAX_TIMEOUT = 2147483647
jest.setTimeout(MAX_TIMEOUT)

describe("gatsby new", () => {
  describe("default starter", () => {
    const siteName = "gatsby-default"

    afterAll(() => removeFolder(siteName))

    it("creates a gatsby site", () => {
      const [code, logs] = invokeCli("new", siteName)

      expect(logs).toMatchInlineSnapshot(`
        "info Creating new site from git: https://github.com/gatsbyjs/gatsby-starter-default.git
        success Created starter directory layout
        info Installing packages...
        [1/4] Resolving packages...
        [2/4] Fetching packages...
        [3/4] Linking dependencies...
        [4/4] Building fresh packages...
        success Saved lockfile.
        info
        Your new Gatsby site has been successfully bootstrapped. Start developing it by running:

          cd gatsby-default
          gatsby develop

        Cloning into 'gatsby-default'...
        warning \\"gatsby > react-hot-loader@4.12.20\\" has unmet peer dependency \\"@types/react@^15.0.0 || ^16.0.0\\".
        warning \\"gatsby > @typescript-eslint/eslint-plugin > tsutils@3.17.1\\" has unmet peer dependency \\"typescript@>=2.8.0 || >= 3.2.0-dev || >= 3.3.0-dev || >= 3.4.0-dev || >= 3.5.0-dev || >= 3.6.0-dev || >= 3.6.0-beta || >= 3.7.0-dev || >= 3.7.0-beta\\".
        "
      `)
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

      expect(logs).toMatchInlineSnapshot(`
        "info Creating new site from git: https://github.com/gatsbyjs/gatsby-starter-blog.git
        success Created starter directory layout
        info Installing packages...
        [1/4] Resolving packages...
        [2/4] Fetching packages...
        [3/4] Linking dependencies...
        [4/4] Building fresh packages...
        success Saved lockfile.
        info
        Your new Gatsby site has been successfully bootstrapped. Start developing it by running:

          cd gatsby-blog
          gatsby develop

        Cloning into 'gatsby-blog'...
        warning \\"gatsby > react-hot-loader@4.12.20\\" has unmet peer dependency \\"@types/react@^15.0.0 || ^16.0.0\\".
        warning \\"gatsby > @typescript-eslint/eslint-plugin > tsutils@3.17.1\\" has unmet peer dependency \\"typescript@>=2.8.0 || >= 3.2.0-dev || >= 3.3.0-dev || >= 3.4.0-dev || >= 3.5.0-dev || >= 3.6.0-dev || >= 3.6.0-beta || >= 3.7.0-dev || >= 3.7.0-beta\\".
        "
      `)
      expect(code).toBe(0)
    })
  })

  describe("invalid starter", () => {
    const siteName = "gatsby-invalid"

    afterAll(() => removeFolder(siteName))

    it("fails to create a gatsby site", () => {
      const [code, logs] = invokeCli("new", siteName, "tHiS-Is-A-fAkE-sTaRtEr")

      expect(logs).toMatchInlineSnapshot(`
        "
         ERROR

        starter tHiS-Is-A-fAkE-sTaRtEr doesn't exist


        [0m
        [0m  [0m[97m[41mError[0m[37m[41m:[0m[37m[41m [0m[97m[41mstarter tHiS-Is-A-fAkE-sTaRtEr doesn't exist[0m
        [0m  [0m
        [0m  [0m[90m-[0m [0m[93minit-starter.js[0m[90m:[0m[93m198[0m[37m [0m
        [0m  [0m  [0m[90m/Users/blainekasten/Sites/gatsby/packages/gatsby-cli/lib/init-starter.js:198[0m  [0m  [0m[90m:13[0m
        [0m  [0m
        [0m  [0m[90m-[0m [0m[37mGenerator.next[0m
        [0m  [0m
        [0m
        "
      `)
      expect(code).toBe(1)
    })
  })
})
