"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _groupBy = _interopRequireDefault(require("lodash/groupBy"));

var _path = _interopRequireDefault(require("path"));

var _gatsbyNode = _interopRequireDefault(require("../gatsby-node"));

describe(`transformer-react-doc-gen: onCreateNode`, function () {
  var actions, node, createdNodes, updatedNodes;

  var run = function run(node, opts) {
    if (node === void 0) {
      node = node;
    }

    if (opts === void 0) {
      opts = {};
    }

    return _gatsbyNode.default.onCreateNode({
      node,
      actions
    }, opts);
  };

  beforeEach(function () {
    createdNodes = [];
    updatedNodes = [];
    node = {
      id: `node_1`,
      children: [],
      absolutePath: _path.default.join(__dirname, `fixtures`, `code.js`),
      internal: {
        mediaType: `application/javascript`,
        type: `File`
      }
    };
    actions = {
      createNode: jest.fn(function (n) {
        return createdNodes.push(n);
      }),
      createParentChildLink: jest.fn(function (n) {
        return updatedNodes.push(n);
      })
    };
  });
  it(`should extract out a description, params, and examples`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return run(node);

          case 2:
            expect(createdNodes).toMatchSnapshot();

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it(`should only process javascript File nodes`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2() {
    var result;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return run({
              internal: {
                mediaType: `text/x-foo`
              }
            });

          case 2:
            result = _context2.sent;
            expect(result).toBeNull();
            _context2.next = 6;
            return run({
              internal: {
                mediaType: `application/javascript`
              }
            });

          case 6:
            result = _context2.sent;
            expect(result).toBeNull();
            _context2.next = 10;
            return run({
              id: `test`,
              children: [],
              absolutePath: _path.default.join(__dirname, `fixtures`, `code.js`),
              internal: {
                mediaType: `application/javascript`,
                type: `File`
              }
            });

          case 10:
            result = _context2.sent;
            expect(createdNodes.length).toBeGreaterThan(0);

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
  it(`should extract create description nodes with markdown types`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3() {
    var types;
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return run(node);

          case 2:
            types = (0, _groupBy.default)(createdNodes, `internal.type`);
            expect(types.DocumentationJSComponentDescription.every(function (d) {
              return d.internal.mediaType === `text/markdown`;
            })).toBe(true);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));
});