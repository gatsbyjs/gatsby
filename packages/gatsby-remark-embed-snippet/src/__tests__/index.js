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

  describe(`CSS files`, () => {
    beforeEach(() => {
      fs.readFileSync.mockReturnValue(`html { height: 100%; }`)
    })

    it(`should extract the correct Prism language`, () => {
      const markdownAST = remark.parse(`\`embed:hello-world.css\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })

    it(`should support highlight-line and highlight-next-line markers`, () => {
      fs.readFileSync.mockReturnValue(
        `
        html {
          /* highlight-next-line */
          height: 100%;
        }

        * {
          box-sizing: border-box; /* highlight-line */
        }
      `
          .replace(/^ +/gm, ``)
          .trim()
      )

      const markdownAST = remark.parse(`\`embed:hello-world.css\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })
  })

  describe(`HTML files`, () => {
    it(`should extract the correct Prism language`, () => {
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

    it(`should support highlight-line and highlight-next-line markers`, () => {
      fs.readFileSync.mockReturnValue(
        `
        <html>
          <body>
            <h1>highlight me</h1> <!-- highlight-line -->
            <p>
              <!-- highlight-next-line -->
              And me
            </p>
          </body>
        </html>
      `
          .replace(/^ +/gm, ``)
          .trim()
      )

      const markdownAST = remark.parse(`\`embed:hello-world.html\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })
  })

  describe(`JavaScript files`, () => {
    it(`should extract the correct Prism language`, () => {
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

    it(`should support highlight-line and highlight-next-line markers`, () => {
      fs.readFileSync.mockReturnValue(
        `
        import React from 'react';
        import ReactDOM from 'react-dom';

        // highlight-next-line
        ReactDOM.render(
          <h1>Hello, world!</h1>,
          document.getElementById('root')
        ); // highlight-line
      `
          .replace(/^ +/gm, ``)
          .trim()
      )

      const markdownAST = remark.parse(`\`embed:hello-world.js\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })
  })

  describe(`Markdown files`, () => {
    it(`should extract the correct Prism language`, () => {
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
  })

  describe(`YAML files`, () => {
    beforeEach(() => {
      fs.readFileSync.mockReturnValue(`name: Brian Vaughn`)
    })

    it(`should extract the correct Prism language`, () => {
      const markdownAST = remark.parse(`\`embed:hello-world.yaml\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })

    it(`should support highlight-line and highlight-next-line markers`, () => {
      fs.readFileSync.mockReturnValue(
        `
        foo: 1 # highlight-line
        bar: 2
        # highlight-next-line 
        baz: 3
      `
          .replace(/^ +/gm, ``)
          .trim()
      )

      const markdownAST = remark.parse(`\`embed:hello-world.yaml\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })
  })

  describe(`unknown file extensions`, () => {
    it(`should set the correct default Prism language`, () => {
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
