jest.mock(`fs`, () => {
  return {
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
  }
})
jest.mock(`recursive-readdir`, () => jest.fn())
jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    panic: jest.fn(),
  }
})

const fs = require(`fs`)
const readdir = require(`recursive-readdir`)

const reporter = require(`gatsby-cli/lib/reporter`)

const {
  OPTION_DEFAULT_HTML,
  OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH,
} = require(`../constants`)
const { createPages } = require(`../gatsby-node`)

const createPage = jest.fn()
const createPagesParams = {
  actions: {
    createPage,
  },
  reporter,
}

const throwFileNotFoundErr = path => {
  const err = new Error(`no such file or directory '${path}'`)
  err.code = `ENOENT`
  throw err
}

describe(`gatsby-remark-code-repls`, () => {
  beforeEach(() => {
    fs.existsSync.mockReset()
    fs.existsSync.mockReturnValue(true)

    fs.readFileSync.mockReset()
    fs.readFileSync.mockReturnValue(`const foo = "bar";`)

    readdir.mockReset()
    readdir.mockResolvedValue([`file.js`])

    createPage.mockReset()
  })

  describe(`gatsby-node`, () => {
    it(`should iterate over all JavaScript files in the examples directory`, async () => {
      readdir.mockResolvedValue([`root-file.js`, `path/to/nested/file.jsx`])

      await createPages(createPagesParams)

      expect(fs.readFileSync).toHaveBeenCalledTimes(2)
      expect(fs.readFileSync).toHaveBeenCalledWith(`root-file.js`, `utf8`)
      expect(fs.readFileSync).toHaveBeenCalledWith(
        `path/to/nested/file.jsx`,
        `utf8`
      )
    })

    it(`should ignore non JavaScript files in the examples directory`, async () => {
      readdir.mockResolvedValue([`javascript.js`, `not-javascript.html`])

      await createPages(createPagesParams)

      expect(fs.readFileSync).toHaveBeenCalledTimes(1)
      expect(fs.readFileSync).toHaveBeenCalledWith(`javascript.js`, `utf8`)
    })

    it(`should error if provided an invalid examples directory`, async () => {
      fs.existsSync.mockReturnValue(false)

      try {
        await createPages(createPagesParams)
      } catch (err) {
        expect(err).toEqual(Error(`Invalid REPL directory specified: "REPL/"`))
      }
    })

    it(`should warn about an empty examples directory`, async () => {
      readdir.mockResolvedValue([])

      spyOn(console, `warn`) // eslint-disable-line no-undef

      await createPages(createPagesParams)

      expect(console.warn).toHaveBeenCalledWith(
        `Specified REPL directory "REPL/" contains no files`
      )
    })

    it(`should create redirect pages for the code in each example file`, async () => {
      readdir.mockResolvedValue([`root-file.js`, `path/to/nested/file.jsx`])

      await createPages(createPagesParams)

      expect(createPage).toHaveBeenCalledTimes(2)
      expect(createPage.mock.calls[0][0].path).toContain(`root-file`)
      expect(createPage.mock.calls[1][0].path).toContain(`path/to/nested/file`)
    })

    it(`should use a default redirect template`, async () => {
      readdir.mockResolvedValue([`file.js`])

      await createPages(createPagesParams)

      expect(createPage).toHaveBeenCalledTimes(1)
      expect(createPage.mock.calls[0][0].component).toContain(
        OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH
      )
    })

    it(`should use a specified redirect template override`, async () => {
      readdir.mockResolvedValue([`file.js`])

      await createPages(createPagesParams, { redirectTemplate: `foo/bar.js` })

      expect(createPage).toHaveBeenCalledTimes(1)
      expect(createPage.mock.calls[0][0].component).toContain(`foo/bar.js`)
    })

    it(`should error if an invalid redirect template is specified`, async () => {
      fs.existsSync.mockImplementation(path => path !== `foo/bar.js`)

      try {
        await createPages(createPagesParams, { redirectTemplate: `foo/bar.js` })
      } catch (err) {
        expect(err).toEqual(
          Error(`Invalid REPL redirectTemplate specified: "foo/bar.js"`)
        )
      }
    })

    it(`should propagate any Error from recursive-readdir`, async () => {
      const error = TypeError(`glob pattern string required`)

      readdir.mockRejectedValue(error)

      try {
        await createPages(createPagesParams)
      } catch (err) {
        expect(err).toBe(error)
      }
    })

    it(`should not load any external packages by default`, async () => {
      readdir.mockResolvedValue([`file.js`])

      await createPages(createPagesParams)

      const { js_external } = JSON.parse(
        createPage.mock.calls[0][0].context.payload
      )

      expect(js_external).toBe(``)
    })

    it(`should load custom externals if specified`, async () => {
      readdir.mockResolvedValue([`file.js`])

      await createPages(createPagesParams, { externals: [`foo.js`, `bar.js`] })

      const { js_external } = JSON.parse(
        createPage.mock.calls[0][0].context.payload
      )

      expect(js_external).toContain(`foo.js`)
      expect(js_external).toContain(`bar.js`)
    })

    it(`should inject the required prop-types for the Codepen prefill API`, async () => {
      readdir.mockResolvedValue([`file.js`])

      await createPages(createPagesParams)

      const { action, payload } = createPage.mock.calls[0][0].context

      expect(action).toBeTruthy()
      expect(payload).toBeTruthy()
    })

    it(`should render default HTML for index page if no override specified`, async () => {
      readdir.mockResolvedValue([`file.js`])

      await createPages(createPagesParams, {})

      const { html } = JSON.parse(createPage.mock.calls[0][0].context.payload)

      expect(html).toBe(OPTION_DEFAULT_HTML)
    })

    it(`should support custom, user-defined HTML for index page`, async () => {
      readdir.mockResolvedValue([`file.js`])

      await createPages(createPagesParams, { html: `<span id="foo"></span>` })

      const { html } = JSON.parse(createPage.mock.calls[0][0].context.payload)

      expect(html).toBe(`<span id="foo"></span>`)
    })

    it(`should support includeMatchingCSS = "true" when matching file exists`, async () => {
      readdir.mockResolvedValue([`file.js`, `file.css`])
      fs.readFileSync.mockReset()
      fs.readFileSync.mockImplementation((path, options) => {
        if (path === `file.js`) {
          return `const foo = "bar";`
        } else if (path === `file.css`) {
          return `html { color: red; }`
        } else {
          throwFileNotFoundErr(path)
        }
        return null
      })

      await createPages(createPagesParams, {
        includeMatchingCSS: true,
      })

      const { css, js } = JSON.parse(
        createPage.mock.calls[0][0].context.payload
      )

      expect(js).toBe(`const foo = "bar";`)
      expect(css).toBe(`html { color: red; }`)
    })

    it(`should support includeMatchingCSS = "false" when matching file exists`, async () => {
      readdir.mockResolvedValue([`file.js`, `file.css`])
      fs.readFileSync.mockReset()
      fs.readFileSync.mockImplementation((path, options) => {
        if (path === `file.js`) {
          return `const foo = "bar";`
        } else if (path === `file.css`) {
          return `html { color: red; }`
        } else {
          throwFileNotFoundErr(path)
        }
        return null
      })

      await createPages(createPagesParams, {
        includeMatchingCSS: false,
      })

      const { css, js } = JSON.parse(
        createPage.mock.calls[0][0].context.payload
      )

      expect(js).toBe(`const foo = "bar";`)
      expect(css).toBe(undefined)
    })

    it(`should support includeMatchingCSS = "true" when matching file doesn't exist`, async () => {
      readdir.mockResolvedValue([`file.js`])
      fs.readFileSync.mockReset()
      fs.readFileSync.mockImplementation((path, options) => {
        if (path === `file.js`) {
          return `const foo = "bar";`
        } else {
          throwFileNotFoundErr(path)
        }
        return null
      })

      await createPages(createPagesParams, {
        includeMatchingCSS: true,
      })

      const { css, js } = JSON.parse(
        createPage.mock.calls[0][0].context.payload
      )

      expect(js).toBe(`const foo = "bar";`)
      expect(css).toBe(undefined)
    })

    it(`should support includeMatchingCSS = "false" when matching file doesn't exist`, async () => {
      readdir.mockResolvedValue([`file.js`])
      fs.readFileSync.mockReset()
      fs.readFileSync.mockImplementation((path, options) => {
        if (path === `file.js`) {
          return `const foo = "bar";`
        } else {
          throwFileNotFoundErr(path)
        }
        return null
      })

      await createPages(createPagesParams, {
        includeMatchingCSS: false,
      })

      const { css, js } = JSON.parse(
        createPage.mock.calls[0][0].context.payload
      )

      expect(js).toBe(`const foo = "bar";`)
      expect(css).toBe(undefined)
    })
  })
})
