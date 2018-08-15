"use strict";

jest.mock("fs", function () {
  return {
    existsSync: jest.fn(),
    readFileSync: jest.fn()
  };
});

var fs = require("fs");

var Remark = require("remark");

var plugin = require("../index");

var remark = new Remark();
describe("gatsby-remark-embed-snippet", function () {
  beforeEach(function () {
    fs.existsSync.mockReset();
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReset();
    fs.readFileSync.mockReturnValue("const foo = \"bar\";");
  });
  it("should error if missing required config options", function () {
    var markdownAST = remark.parse("`embed:hello-world.js`");
    expect(function () {
      return plugin({
        markdownAST: markdownAST
      });
    }).toThrow("Required option \"directory\" not specified");
  });
  it("should error if the specified directory does not exist", function () {
    fs.existsSync.mockReturnValue(false);
    var markdownAST = remark.parse("`embed:hello-world.js`");
    expect(function () {
      return plugin({
        markdownAST: markdownAST
      }, {
        directory: "invalid"
      });
    }).toThrow("Invalid directory specified \"invalid\"");
  });
  it("should error if an invalid file path is specified", function () {
    fs.existsSync.mockImplementation(function (path) {
      return path !== "examples/hello-world.js";
    });
    var markdownAST = remark.parse("`embed:hello-world.js`");
    expect(function () {
      return plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
    }).toThrow("Invalid snippet specified; no such file \"examples/hello-world.js\"");
  });
  it("should not modify non-embed inlineCode nodes", function () {
    var markdownAST = remark.parse("`console.log(\"hi\")`");
    var transformed = plugin({
      markdownAST: markdownAST
    }, {
      directory: "examples"
    });
    expect(transformed).toMatchSnapshot();
  });
  it("should convert embed inlineCode nodes to Prism code blocks", function () {
    var markdownAST = remark.parse("`embed:hello-world.js`");
    var transformed = plugin({
      markdownAST: markdownAST
    }, {
      directory: "examples"
    });
    expect(transformed).toMatchSnapshot();
  });
  it("should error if an invalid range expression is specified", function () {
    spyOn(console, "warn");
    fs.readFileSync.mockReturnValue("\n      // highlight-range 1\n      console.log(\"oops!\");\n    ".replace(/^ +/gm, "").trim());
    var markdownAST = remark.parse("`embed:hello-world.js`");
    var transformed = plugin({
      markdownAST: markdownAST
    }, {
      directory: "examples"
    });
    expect(transformed).toMatchSnapshot();
    expect(console.warn).toHaveBeenCalledWith("Invalid match specified: \"// highlight-range 1\"");
  });
  describe("CSS files", function () {
    it("should extract the correct Prism language", function () {
      fs.readFileSync.mockReturnValue("html { height: 100%; }");
      var markdownAST = remark.parse("`embed:hello-world.css`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support highlight-line and highlight-next-line markers", function () {
      fs.readFileSync.mockReturnValue("\n        html {\n          /* highlight-next-line */\n          height: 100%;\n        }\n\n        * {\n          box-sizing: border-box; /* highlight-line */\n        }\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.css`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support highlight-range markers", function () {
      fs.readFileSync.mockReturnValue("\n        html {\n          /* highlight-range{1,2} */\n          height: 100%;\n          width: 100%;\n        }\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.css`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
  });
  describe("HTML files", function () {
    it("should extract the correct Prism language", function () {
      fs.readFileSync.mockReturnValue("<html></html>");
      var markdownAST = remark.parse("`embed:hello-world.html`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support highlight-line and highlight-next-line markers", function () {
      fs.readFileSync.mockReturnValue("\n        <html>\n          <body>\n            <h1>highlighted</h1> <!-- highlight-line -->\n            <p>\n              <!-- highlight-next-line -->\n              highlighted\n            </p>\n          </body>\n        </html>\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.html`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support highlight-range markers", function () {
      fs.readFileSync.mockReturnValue("\n        <html>\n          <body>\n            <!-- highlight-range{2} -->\n            <p>\n              highlighted\n            </p>\n          </body>\n        </html>\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.html`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
  });
  describe("JavaScript files", function () {
    it("should extract the correct Prism language", function () {
      fs.readFileSync.mockReturnValue("const foo = \"bar\";");
      var markdownAST = remark.parse("`embed:hello-world.js`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support highlight-line and highlight-next-line markers", function () {
      fs.readFileSync.mockReturnValue("\n        import React from 'react';\n        import ReactDOM from 'react-dom';\n\n        // highlight-next-line\n        ReactDOM.render(\n          <h1>Hello, world!</h1>,\n          document.getElementById('root')\n        ); // highlight-line\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.js`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support highlight-range markers", function () {
      fs.readFileSync.mockReturnValue("\n        // highlight-range{2,3}\n        ReactDOM.render(\n          <h1>Hello, world!</h1>,\n          document.getElementById('root')\n        );\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.js`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support JSX line highlight comments", function () {
      fs.readFileSync.mockReturnValue("\n        <div>\n          <button>Add Item</button> {/* highlight-line */}\n\n          <ReactCSSTransitionGroup\n            transitionName=\"example\"\n            transitionEnterTimeout={500}\n            transitionLeaveTimeout={300}>\n            {/* highlight-next-line */}\n            {items}\n          </ReactCSSTransitionGroup>\n        </div>\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.js`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support highlighting a range via JSX comments", function () {
      fs.readFileSync.mockReturnValue("\n        <ul>\n          {/* highlight-range{2-4} */}\n          <li>Not highlighted</li>\n          <li>Highlighted</li>\n          <li>Highlighted</li>\n          <li>Highlighted</li>\n          <li>Not highlighted</li>\n        </div>\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.js`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support multiple highlight directives within a single file", function () {
      fs.readFileSync.mockReturnValue("\n        let notHighlighted;\n        // highlight-range{1}\n        let highlighted;\n\n        notHighlighted = 1;\n\n        // highlight-next-line\n        highlighted = 2;\n\n        // highlight-range{2}\n        notHighlighted = 3;\n        highlighted = 4;\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.js`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
  });
  describe("Markdown files", function () {
    it("should extract the correct Prism language", function () {
      fs.readFileSync.mockReturnValue("# Hi");
      var markdownAST = remark.parse("`embed:hello-world.md`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
  });
  describe("shell scripts", function () {
    it("should extract the correct Prism language", function () {
      fs.readFileSync.mockReturnValue("pwd");
      var markdownAST = remark.parse("`embed:hello-world.sh`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support highlight-line and highlight-next-line markers", function () {
      fs.readFileSync.mockReturnValue("\n        # Yarn\n        yarn init\n        yarn add react react-dom # highlight-line\n\n        # NPM\n        npm init\n        # highlight-next-line\n        npm install --save react react-dom\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.sh`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support highlight-range markers", function () {
      fs.readFileSync.mockReturnValue("\n        # highlight-range{2-3}\n        echo \"not highlighted\"\n        echo \"highlighted\"\n        echo \"highlighted\"\n        echo \"not highlighted\"\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.sh`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
  });
  describe("YAML files", function () {
    it("should extract the correct Prism language", function () {
      fs.readFileSync.mockReturnValue("name: Brian Vaughn");
      var markdownAST = remark.parse("`embed:hello-world.yaml`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support highlight-line and highlight-next-line markers", function () {
      fs.readFileSync.mockReturnValue("\n        foo: \"highlighted\" # highlight-line\n        bar: \"not highlighted\"\n        # highlight-next-line\n        baz: \"highlighted\"\n        qux: \"not highlighted\"\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.yaml`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
    it("should support highlight-range markers", function () {
      fs.readFileSync.mockReturnValue("\n        # highlight-range{1,3}\n        foo: \"highlighted\"\n        bar: \"not highlighted\"\n        baz: \"highlighted\"\n      ".replace(/^ +/gm, "").trim());
      var markdownAST = remark.parse("`embed:hello-world.yaml`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
  });
  describe("unknown file extensions", function () {
    it("should set the correct default Prism language", function () {
      var markdownAST = remark.parse("`embed:hello-world`");
      var transformed = plugin({
        markdownAST: markdownAST
      }, {
        directory: "examples"
      });
      expect(transformed).toMatchSnapshot();
    });
  });
});