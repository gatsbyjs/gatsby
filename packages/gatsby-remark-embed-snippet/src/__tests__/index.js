jest.mock(`fs`, () => {
  return {
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
  }
})

const fs = require(`fs`)
const Remark = require(`remark`)
const plugin = require(`../index`)

const remark = new Remark()

describe(`gatsby-remark-embed-snippet`, () => {
  beforeEach(() => {
    fs.existsSync.mockReset()
    fs.existsSync.mockReturnValue(true)

    fs.readFileSync.mockReset()
    fs.readFileSync.mockReturnValue(`const foo = "bar";`)
  })

  it(`should error if missing required config options`, () => {
    const markdownAST = remark.parse(`\`embed:hello-world.js\``)

    expect(() => plugin({ markdownAST })).toThrow(
      `Required option "directory" not specified`
    )
  })

  it(`should error if the specified directory does not exist`, () => {
    fs.existsSync.mockReturnValue(false)

    const markdownAST = remark.parse(`\`embed:hello-world.js\``)

    expect(() => plugin({ markdownAST }, { directory: `invalid` })).toThrow(
      `Invalid directory specified "invalid"`
    )
  })

  it(`should error if an invalid file path is specified`, () => {
    fs.existsSync.mockImplementation(path => path !== `examples/hello-world.js`)

    const markdownAST = remark.parse(`\`embed:hello-world.js\``)

    expect(() => plugin({ markdownAST }, { directory: `examples` })).toThrow(
      `Invalid snippet specified; no such file "examples/hello-world.js"`
    )
  })

  it(`should not modify non-embed inlineCode nodes`, () => {
    const markdownAST = remark.parse(`\`console.log("hi")\``)
    const transformed = plugin({ markdownAST }, { directory: `examples` })

    expect(transformed).toMatchSnapshot()
  })

  it(`should convert embed inlineCode nodes to Prism code blocks`, () => {
    const markdownAST = remark.parse(`\`embed:hello-world.js\``)
    const transformed = plugin({ markdownAST }, { directory: `examples` })

    expect(transformed).toMatchSnapshot()
  })

  describe(`Language detection`, () => {
    it(`should set the correct Prism language for CSS files`, () => {
      fs.readFileSync.mockReturnValue(`html { height: 100%; }`)

      const markdownAST = remark.parse(`\`embed:hello-world.css\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })

    it(`should set the correct Prism language for HTML files`, () => {
      fs.readFileSync.mockReturnValue(`<html></html>`)

      const markdownAST = remark.parse(`\`embed:hello-world.html\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })

    it(`should set the correct Prism language for JavaScript files`, () => {
      fs.readFileSync.mockReturnValue(`const foo = "bar";`)

      const markdownAST = remark.parse(`\`embed:hello-world.js\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })

    it(`should set the correct Prism language for Markdown files`, () => {
      fs.readFileSync.mockReturnValue(`# Hi`)

      const markdownAST = remark.parse(`\`embed:hello-world.md\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })

    it(`should set the correct Prism language for shell scripts`, () => {
      fs.readFileSync.mockReturnValue(`pwd`)

      const markdownAST = remark.parse(`\`embed:hello-world.sh\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })

    it(`should set the correct Prism language for YAML files`, () => {
      fs.readFileSync.mockReturnValue(`name: Brian Vaughn`)

      const markdownAST = remark.parse(`\`embed:hello-world.yaml\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })

    it(`should set the default Prism language for unknown file extensions`, () => {
      const markdownAST = remark.parse(`\`embed:hello-world\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })
  })
})
