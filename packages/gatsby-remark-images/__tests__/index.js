"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock("gatsby-plugin-sharp", function () {
  return {
    responsiveSizes: function responsiveSizes(_ref) {
      var file = _ref.file,
          args = _ref.args;

      return _promise2.default.resolve({
        aspectRatio: 0.75,
        originalImage: file.absolutePath,
        src: file.absolutePath,
        srcSet: file.absolutePath + ", " + file.absolutePath,
        sizes: "(max-width: " + args.maxWidth + "px) 100vw, " + args.maxWidth + "px",
        base64: "url('data:image/png;base64, iVBORw)"
      });
    }
  };
});

var Remark = require("remark");

var plugin = require("../");

var remark = new Remark().data("settings", {
  commonmark: true,
  footnotes: true,
  pedantic: true
});

var createNode = function createNode(content) {
  var node = {
    id: 1234
  };

  var markdownNode = {
    id: node.id + " >>> MarkdownRemark",
    children: [],
    parent: node.id,
    internal: {
      content: content,
      contentDigest: "some-hash",
      type: "MarkdownRemark"
    }
  };

  markdownNode.frontmatter = {
    title: "", // always include a title
    parent: node.id
  };

  return markdownNode;
};

var createPluginOptions = function createPluginOptions(content) {
  var imagePaths = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "/";

  var dirName = "not-a-real-dir";
  return {
    files: [].concat(imagePaths).map(function (imagePath) {
      return {
        absolutePath: dirName + "/" + imagePath
      };
    }),
    markdownNode: createNode(content),
    markdownAST: remark.parse(content),
    getNode: function getNode() {
      return {
        dir: dirName
      };
    }
  };
};

test("it returns empty array when 0 images", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
  var content, result;
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          content = "\n# hello world\n\nLook ma, no images\n  ".trim();
          _context.next = 3;
          return plugin(createPluginOptions(content));

        case 3:
          result = _context.sent;


          expect(result).toEqual([]);

        case 5:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, undefined);
})));

test("it leaves non-relative images alone", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
  var imagePath, content, result;
  return _regenerator2.default.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          imagePath = "https://google.com/images/an-image.jpeg";
          content = ("\n![asdf](" + imagePath + ") \n  ").trim();
          _context2.next = 4;
          return plugin(createPluginOptions(content, imagePath));

        case 4:
          result = _context2.sent;


          expect(result).toEqual([]);

        case 6:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2, undefined);
})));

test("it transforms images in markdown", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
  var imagePath, content, nodes, node;
  return _regenerator2.default.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          imagePath = "images/my-image.jpeg";
          content = ("\n\n![image](./" + imagePath + ")\n  ").trim();
          _context3.next = 4;
          return plugin(createPluginOptions(content, imagePath));

        case 4:
          nodes = _context3.sent;


          expect(nodes.length).toBe(1);

          node = nodes.pop();

          expect(node.type).toBe("html");
          expect(node.value).toMatchSnapshot();

        case 9:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3, undefined);
})));

test("it transforms multiple images in markdown", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
  var imagePaths, content, nodes;
  return _regenerator2.default.wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          imagePaths = ["images/my-image.jpeg", "images/other-image.jpeg"];
          content = ("\n![image 1](./" + imagePaths[0] + ")\n![image 2](./" + imagePaths[1] + ")\n  ").trim();
          _context4.next = 4;
          return plugin(createPluginOptions(content, imagePaths));

        case 4:
          nodes = _context4.sent;


          expect(nodes.length).toBe(imagePaths.length);

        case 6:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4, undefined);
})));

test("it transforms HTML img tags", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
  var imagePath, content, nodes, node;
  return _regenerator2.default.wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          imagePath = "image/my-image.jpeg";
          content = ("\n<img src=\"./" + imagePath + "\">\n  ").trim();
          _context5.next = 4;
          return plugin(createPluginOptions(content, imagePath));

        case 4:
          nodes = _context5.sent;


          expect(nodes.length).toBe(1);

          node = nodes.pop();

          expect(node.type).toBe("html");
          expect(node.value).toMatchSnapshot();

        case 9:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5, undefined);
})));

test("it leaves non-relative HTML img tags alone", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
  var imagePath, content, nodes;
  return _regenerator2.default.wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          imagePath = "https://google.com/images/this-was-an-image.jpeg";
          content = ("\n<img src=\"" + imagePath + "\">\n  ").trim();
          _context6.next = 4;
          return plugin(createPluginOptions(content, imagePath));

        case 4:
          nodes = _context6.sent;


          expect(nodes.length).toBe(0);

        case 6:
        case "end":
          return _context6.stop();
      }
    }
  }, _callee6, undefined);
})));