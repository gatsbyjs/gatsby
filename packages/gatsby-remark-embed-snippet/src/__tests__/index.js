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

  it(`should error if an invalid range expression is specified`, () => {
    spyOn(console, `warn`)

    fs.readFileSync.mockReturnValue(
      `
      // highlight-range 1
      console.log("oops!");
    `
        .replace(/^ +/gm, ``)
        .trim()
    )

    const markdownAST = remark.parse(`\`embed:hello-world.js\``)
    const transformed = plugin({ markdownAST }, { directory: `examples` })

    expect(transformed).toMatchSnapshot()

    expect(console.warn).toHaveBeenCalledWith(
      `Invalid match specified: "// highlight-range 1"`
    )
  })

  describe(`CSS files`, () => {
    it(`should extract the correct Prism language`, () => {
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

    it(`should support highlight-range markers`, () => {
      fs.readFileSync.mockReturnValue(
        `
        html {
          /* highlight-range{1,2} */
          height: 100%;
          width: 100%;
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
            <h1>highlighted</h1> <!-- highlight-line -->
            <p>
              <!-- highlight-next-line -->
              highlighted
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

    it(`should support highlight-range markers`, () => {
      fs.readFileSync.mockReturnValue(
        `
        <html>
          <body>
            <!-- highlight-range{2} -->
            <p>
              highlighted
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

    it(`should support highlight-range markers`, () => {
      fs.readFileSync.mockReturnValue(
        `
        // highlight-range{2,3}
        ReactDOM.render(
          <h1>Hello, world!</h1>,
          document.getElementById('root')
        );
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

    it(`should support JSX line highlight comments`, () => {
      fs.readFileSync.mockReturnValue(
        `
        <div>
          <button>Add Item</button> {/* highlight-line */}

          <ReactCSSTransitionGroup
            transitionName="example"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
            {/* highlight-next-line */}
            {items}
          </ReactCSSTransitionGroup>
        </div>
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

    it(`should support highlighting a range via JSX comments`, () => {
      fs.readFileSync.mockReturnValue(
        `
        <ul>
          {/* highlight-range{2-4} */}
          <li>Not highlighted</li>
          <li>Highlighted</li>
          <li>Highlighted</li>
          <li>Highlighted</li>
          <li>Not highlighted</li>
        </div>
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

    it(`should support multiple highlight directives within a single file`, () => {
      fs.readFileSync.mockReturnValue(
        `
        let notHighlighted;
        // highlight-range{1}
        let highlighted;

        notHighlighted = 1;

        // highlight-next-line
        highlighted = 2;

        // highlight-range{2}
        notHighlighted = 3;
        highlighted = 4;
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

  describe(`shell scripts`, () => {
    it(`should extract the correct Prism language`, () => {
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

    it(`should support highlight-line and highlight-next-line markers`, () => {
      fs.readFileSync.mockReturnValue(
        `
        # Yarn
        yarn init
        yarn add react react-dom # highlight-line

        # NPM
        npm init
        # highlight-next-line
        npm install --save react react-dom
      `
          .replace(/^ +/gm, ``)
          .trim()
      )

      const markdownAST = remark.parse(`\`embed:hello-world.sh\``)
      const transformed = plugin(
        { markdownAST },
        {
          directory: `examples`,
        }
      )

      expect(transformed).toMatchSnapshot()
    })

    it(`should support highlight-range markers`, () => {
      fs.readFileSync.mockReturnValue(
        `
        # highlight-range{2-3}
        echo "not highlighted"
        echo "highlighted"
        echo "highlighted"
        echo "not highlighted"
      `
          .replace(/^ +/gm, ``)
          .trim()
      )

      const markdownAST = remark.parse(`\`embed:hello-world.sh\``)
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
    it(`should extract the correct Prism language`, () => {
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

    it(`should support highlight-line and highlight-next-line markers`, () => {
      fs.readFileSync.mockReturnValue(
        `
        foo: "highlighted" # highlight-line
        bar: "not highlighted"
        # highlight-next-line
        baz: "highlighted"
        qux: "not highlighted"
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

    it(`should support highlight-range markers`, () => {
      fs.readFileSync.mockReturnValue(
        `
        # highlight-range{1,3}
        foo: "highlighted"
        bar: "not highlighted"
        baz: "highlighted"
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
