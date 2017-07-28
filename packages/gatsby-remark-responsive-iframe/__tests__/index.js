"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Remark = require("remark");
var visit = require("unist-util-visit");

var plugin = require("../");

var remark = new Remark().data("settings", {
  commonmark: true,
  footnotes: true,
  pedantic: true
});

describe("gatsby-remark-responsive-iframe", function () {
  ;["iframe", "object"].forEach(function (tag) {
    it("transforms an " + tag, (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      var markdownAST, transformed;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              markdownAST = remark.parse("\n<" + tag + " url=\"http://www.example.com/\" width=\"600\" height=\"400\"></" + tag + ">\n    ");
              _context.next = 3;
              return plugin({ markdownAST: markdownAST });

            case 3:
              transformed = _context.sent;


              visit(transformed, "unknown", function (node) {
                expect(node.data.hChildren.length).toBeGreaterThan(0);

                var _node$data$hChildren = (0, _slicedToArray3.default)(node.data.hChildren, 1),
                    child = _node$data$hChildren[0];

                expect(child.value).toMatchSnapshot();
              });

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, undefined);
    })));
  });
});