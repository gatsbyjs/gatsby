var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var _Object$keys = require("@babel/runtime/core-js/object/keys");

jest.mock("fs", function () {
  return {
    existsSync: jest.fn(),
    readFileSync: jest.fn()
  };
});

var fs = require("fs");

var Remark = require("remark");

var plugin = require("../index");

var _require = require("../constants"),
    PROTOCOL_BABEL = _require.PROTOCOL_BABEL,
    PROTOCOL_CODEPEN = _require.PROTOCOL_CODEPEN,
    PROTOCOL_CODE_SANDBOX = _require.PROTOCOL_CODE_SANDBOX,
    PROTOCOL_RAMDA = _require.PROTOCOL_RAMDA;

var REMARK_TESTS = {
  Babel: PROTOCOL_BABEL,
  Codepen: PROTOCOL_CODEPEN,
  CodeSandbox: PROTOCOL_CODE_SANDBOX,
  Ramda: PROTOCOL_RAMDA
};
var remark = new Remark();
describe("gatsby-remark-code-repls", function () {
  beforeEach(function () {
    fs.existsSync.mockReset();
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReset();
    fs.readFileSync.mockReturnValue("const foo = \"bar\";");
  });

  _Object$keys(REMARK_TESTS).forEach(function (name) {
    describe(name + " remark transform", function () {
      var protocol = REMARK_TESTS[name];
      it("generates a link for the specified example file",
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee() {
        var markdownAST, transformed;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                markdownAST = remark.parse("[](" + protocol + "file.js)");
                transformed = plugin({
                  markdownAST: markdownAST
                }, {
                  directory: "examples"
                });
                expect(transformed).toMatchSnapshot();

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      })));
      it("generates a link with the specified target",
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee2() {
        var markdownAST, transformed;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                markdownAST = remark.parse("[](" + protocol + "file.js)");
                transformed = plugin({
                  markdownAST: markdownAST
                }, {
                  directory: "examples",
                  target: "_blank"
                });
                expect(transformed).toMatchSnapshot();

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      })));
      it("generates a link for files in nested directories",
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee3() {
        var markdownAST, transformed;
        return _regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                markdownAST = remark.parse("[](" + protocol + "path/to/nested/file.js)");
                transformed = plugin({
                  markdownAST: markdownAST
                }, {
                  directory: "examples"
                });
                expect(transformed).toMatchSnapshot();

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      })));
      it("generates a link with the specified default text", function () {
        var markdownAST = remark.parse("[](" + protocol + "file.js)");
        var transformed = plugin({
          markdownAST: markdownAST
        }, {
          directory: "examples",
          defaultText: "Click me"
        });
        expect(transformed).toMatchSnapshot();
      });
      it("generates a link with the specified inline text even if default text is specified", function () {
        var markdownAST = remark.parse("[Custom link text](" + protocol + "file.js)");
        var transformed = plugin({
          markdownAST: markdownAST
        }, {
          defaultText: "Click me",
          directory: "examples"
        });
        expect(transformed).toMatchSnapshot();
      });
      it("verifies example files relative to the specified directory", function () {
        var markdownAST = remark.parse("[](" + protocol + "path/to/nested/file.js)");
        plugin({
          markdownAST: markdownAST
        }, {
          directory: "examples"
        });
        expect(fs.existsSync).toHaveBeenCalledWith("examples/path/to/nested/file.js");
      });
      it("errors if you do not provide a directory parameter", function () {
        var markdownAST = remark.parse("[](" + protocol + "file.js)");
        expect(function () {
          return plugin({
            markdownAST: markdownAST
          });
        }).toThrow("Required REPL option \"directory\" not specified");
      });
      it("errors if you provide an invalid directory parameter", function () {
        fs.existsSync.mockReturnValue(false);
        var markdownAST = remark.parse("[](" + protocol + "file.js)");
        expect(function () {
          return plugin({
            markdownAST: markdownAST
          }, {
            directory: "fake"
          });
        }).toThrow("Invalid REPL directory specified \"fake\"");
      });

      if (protocol === PROTOCOL_CODE_SANDBOX) {
        it("supports custom html config option for index html", function () {
          var markdownAST = remark.parse("[](" + protocol + "path/to/nested/file.js)");
          var transformed = plugin({
            markdownAST: markdownAST
          }, {
            directory: "examples",
            html: "<span id=\"foo\"></span>"
          });
          expect(transformed).toMatchSnapshot();
        });
        it("supports custom dependencies config option for NPM module dependencies", function () {
          var markdownAST = remark.parse("[](" + protocol + "path/to/nested/file.js)");
          var transformed = plugin({
            markdownAST: markdownAST
          }, {
            dependencies: ["react", "react-dom@next", "prop-types@15.5"],
            directory: "examples"
          });
          expect(transformed).toMatchSnapshot();
        });
      }
    });
  });
});