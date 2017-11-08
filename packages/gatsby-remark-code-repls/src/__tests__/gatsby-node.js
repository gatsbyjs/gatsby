jest.mock(`fs`, () => {
  return {
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
  }
})
jest.mock(`recursive-readdir-synchronous`, () => jest.fn())

const fs = require(`fs`)
const recursiveReaddir = require(`recursive-readdir-synchronous`)

const { OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH } = require(`../constants`)
const { createPages } = require(`../gatsby-node`)

const createPage = jest.fn()

describe(`gatsby-remark-code-repls`, () => {
  beforeEach(() => {
    fs.existsSync.mockReset()
    fs.existsSync.mockReturnValue(true)

    fs.readFileSync.mockReset()
    fs.readFileSync.mockReturnValue(`const foo = "bar";`)

    recursiveReaddir.mockReset()
    recursiveReaddir.mockReturnValue([`file.js`])

    createPage.mockReset()
  })

  describe(`gatsby-node`, () => {
    it(`should iterate over all JavaScript files in the examples directory`, () => {
      recursiveReaddir.mockReturnValue([`root-file.js`, `path/to/nested/file.jsx`])

      createPages({ createPage })

      expect(fs.readFileSync).toHaveBeenCalledTimes(2)
      expect(fs.readFileSync).toHaveBeenCalledWith(`root-file.js`, `utf8`)
      expect(fs.readFileSync).toHaveBeenCalledWith(`path/to/nested/file.jsx`, `utf8`)
    })

    it(`should ignore non JavaScript files in the examples directory`, () => {
      recursiveReaddir.mockReturnValue([`javascript.js`, `not-javascript.html`])

      createPages({ createPage })

      expect(fs.readFileSync).toHaveBeenCalledTimes(1)
      expect(fs.readFileSync).toHaveBeenCalledWith(`javascript.js`, `utf8`)
    })

    it(`should error if provided an invalid examples directory`, () => {
      fs.existsSync.mockReturnValue(false)

      expect(() => createPages({ createPage })).toThrow(`Invalid REPL directory specified: "REPL"`)
    })

    it(`should warn about an empty examples directory`, () => {
      recursiveReaddir.mockReturnValue([])

      spyOn(console, `warn`) // eslint-disable-line no-undef

      createPages({ createPage })

      expect(console.warn).toHaveBeenCalledWith(`Specified REPL directory "REPL" contains no files`)
    })

    it(`should create redirect pages for the code in each example file`, () => {
      recursiveReaddir.mockReturnValue([`root-file.js`, `path/to/nested/file.jsx`])

      createPages({ createPage })

      expect(createPage).toHaveBeenCalledTimes(2)
      expect(createPage.mock.calls[0][0].path).toContain(`root-file`)
      expect(createPage.mock.calls[1][0].path).toContain(`path/to/nested/file`)
   })

    it(`should use a default redirect template`, () => {
      recursiveReaddir.mockReturnValue([`file.js`])

      createPages({ createPage })

      expect(createPage).toHaveBeenCalledTimes(1)
      expect(createPage.mock.calls[0][0].component).toContain(OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH)
    })

    it(`should use a specified redirect template override`, () => {
      recursiveReaddir.mockReturnValue([`file.js`])

      createPages({ createPage }, { redirectTemplate: `foo/bar.js` })

      expect(createPage).toHaveBeenCalledTimes(1)
      expect(createPage.mock.calls[0][0].component).toContain(`foo/bar.js`)
    })

    it(`should error if an invalid redirect template is specified`, () => {
      fs.existsSync.mockImplementation(path => path !== `foo/bar.js`)

      expect(
        () => createPages({ createPage }, { redirectTemplate: `foo/bar.js` })
      ).toThrow(`Invalid REPL redirectTemplate specified`)
    })

    it(`should load react and react-dom packages by default`, () => {
      recursiveReaddir.mockReturnValue([`file.js`])

      createPages({ createPage })

      const { js_external } = JSON.parse(createPage.mock.calls[0][0].context.payload)

      expect(js_external).toContain(`react.development.js`)
      expect(js_external).toContain(`react-dom.development.js`)
    })

    it(`should load additional custom externals if specified`, () => {
      recursiveReaddir.mockReturnValue([`file.js`])

      createPages({ createPage }, { externals: [`foo.js`, `bar.js`] })

      const { js_external } = JSON.parse(createPage.mock.calls[0][0].context.payload)

      expect(js_external).toContain(`foo.js`)
      expect(js_external).toContain(`bar.js`)
    })

    it(`should inject the required prop-types for the Codepen prefill API`, () => {
      recursiveReaddir.mockReturnValue([`file.js`])

      createPages({ createPage })

      const { action, payload } = createPage.mock.calls[0][0].context

      expect(action).toBeTruthy()
      expect(payload).toBeTruthy()
    })
  })
})
