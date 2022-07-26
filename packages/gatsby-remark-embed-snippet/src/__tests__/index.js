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

  it(`should not error if missing optional config options`, () => {
    const markdownAST = remark.parse(`\`embed:hello-world.js\``)

    expect(() => plugin({ markdownAST })).toMatchSnapshot()
  })

  it(`should error if the specified directory does not exist`, () => {
    fs.existsSync.mockReturnValue(false)

    const markdownAST = remark.parse(`\`embed:hello-world.js\``)

    expect(() => plugin({ markdownAST }, { directory: `invalid` })).toThrow(
      `Invalid directory specified "invalid"`
    )
  })

  it(`should display a code block of a single line`, () => {
    const codeBlockValue = `  console.log('hello world')`
    fs.readFileSync.mockReturnValue(`function test() {
${codeBlockValue}
}`)

    const markdownAST = remark.parse(`\`embed:hello-world.js#L2\``)
    const transformed = plugin({ markdownAST }, { directory: `examples` })

    const codeBlock = transformed.children[0].children[0]

    expect(codeBlock.value).toEqual(codeBlockValue)
  })

  it(`should display a code block of a range of lines`, () => {
    const codeBlockValue = `  if (window.location.search.indexOf('query') > -1) {
  console.log('The user is searching')
}`
    fs.readFileSync.mockReturnValue(`function test() {
${codeBlockValue}
}`)

    const markdownAST = remark.parse(`\`embed:hello-world.js#L2-4\``)
    const transformed = plugin({ markdownAST }, { directory: `examples` })

    const codeBlock = transformed.children[0].children[0]

    expect(codeBlock.value).toEqual(codeBlockValue)
  })

  it(`should display a code block of a range of non-consecutive lines`, () => {
    const notInSnippet = `lineShouldNotBeInSnippet();`
    fs.readFileSync.mockReturnValue(`function test() {
  if (window.location.search.indexOf('query') > -1) {
    console.log('The user is searching')
  }
}
${notInSnippet}
window.addEventListener('resize', () => {
  test();
})`)

    const markdownAST = remark.parse(`\`embed:hello-world.js#L2-4,7-9\``)
    const transformed = plugin({ markdownAST }, { directory: `examples` })

    const codeBlock = transformed.children[0].children[0]

    expect(codeBlock.value).not.toContain(notInSnippet)
  })

  it(`should display a code block between start-snippet and end-snippet`, () => {
    const codeBlockValue = `  if (window.location.search.indexOf('query') > -1) {
  console.log('The user is searching')
}`
    fs.readFileSync.mockReturnValue(`function test() {
// start-snippet{foo}
${codeBlockValue}
// end-snippet{foo}
console.log('finish up')
}`)

    const markdownAST = remark.parse(`\`embed:hello-world.js{snippet: "foo"}\``)
    const transformed = plugin({ markdownAST }, { directory: `examples` })

    const codeBlock = transformed.children[0].children[0]

    expect(codeBlock.value).toEqual(codeBlockValue)
  })

  it(`should display a code block from start-snippet to end of file`, () => {
    const codeBlockValue = `  if (window.location.search.indexOf('query') > -1) {
  console.log('The user is searching')
}`
    fs.readFileSync.mockReturnValue(`function test() {
// start-snippet{foo}
${codeBlockValue}
`)

    const markdownAST = remark.parse(`\`embed:hello-world.js{snippet: "foo"}\``)
    const transformed = plugin({ markdownAST }, { directory: `examples` })

    const codeBlock = transformed.children[0].children[0]

    expect(codeBlock.value).toEqual(codeBlockValue)
  })

  it(`should display a code block from the correct snippet`, () => {
    const codeBlockValue = `  if (window.location.search.indexOf('query') > -1) {
  console.log('The user is searching')
}`
    fs.readFileSync.mockReturnValue(`function test() {
// start-snippet{bar}
console.log('Do not stop here!')
// end-snippet{bar}
console.log('Or here')
// start-snippet{foo}
${codeBlockValue}
// end-snippet{foo}
`)

    const markdownAST = remark.parse(`\`embed:hello-world.js{snippet: "foo"}\``)
    const transformed = plugin({ markdownAST }, { directory: `examples` })

    const codeBlock = transformed.children[0].children[0]

    expect(codeBlock.value).toEqual(codeBlockValue)
  })

  it(`should handle missing snippet name`, () => {
    fs.readFileSync.mockReturnValue(`function test() {
  // start-snippet{goo}
  nothing_to_do();
  // end-snippet{goo}
  stuff();
}`)

    const markdownAST = remark.parse(`\`embed:hello-world.js{snippet: "foo"}\``)
    const transformed = plugin({ markdownAST }, { directory: `examples` })

    const codeBlock = transformed.children[0].children[0]

    expect(codeBlock.value).toEqual(``)
  })

  it(`should ignore improperly formatted embed options`, () => {
    fs.readFileSync.mockReturnValue(`function test() {
  // start-snippet{goo}
  nothing_to_do();
  // end-snippet{goo}
  stuff();
}`)

    const optStr = `{snoopet: "foo"}`
    const markdownAST = remark.parse(`\`embed:hello-world.js${optStr}\``)

    expect(() => plugin({ markdownAST }, { directory: `examples` })).toThrow(
      `Invalid snippet options specified: ${optStr}`
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

    it(`should set the correct Prism language for Rust files`, () => {
      fs.readFileSync.mockReturnValue(`extern crate lazy_static;`)

      const markdownAST = remark.parse(`\`embed:hello-world.rs\``)
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
