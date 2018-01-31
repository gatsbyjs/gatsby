"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _lodash = require("lodash");

var _onNodeCreate = _interopRequireDefault(require("../on-node-create"));

var readFile = function readFile(file) {
  return new Promise(function (y, n) {
    _fs.default.readFile(_path.default.join(__dirname, `fixtures`, file), `utf8`, function (err, content) {
      return err ? n(err) : y(content);
    });
  });
};

describe(`transformer-react-doc-gen: onCreateNode`, function () {
  var loadNodeContent, actions, node, createdNodes, updatedNodes;

  var run = function run(node, opts) {
    if (opts === void 0) {
      opts = {};
    }

    return (0, _onNodeCreate.default)({
      node,
      loadNodeContent,
      actions
    }, opts);
  };

  beforeEach(function () {
    createdNodes = [];
    updatedNodes = [];
    node = {
      id: `node_1`,
      children: [],
      internal: {
        mediaType: `application/javascript`
      },
      __fixture: `classes.js`
    };
    loadNodeContent = jest.fn(function (node) {
      return readFile(node.__fixture);
    });
    actions = {
      createNode: jest.fn(function (n) {
        return createdNodes.push(n);
      }),
      createParentChildLink: jest.fn(function (n) {
        return updatedNodes.push(n);
      })
    };
  });
  it(`should only process javascript and jsx nodes`, function () {
    loadNodeContent = jest.fn(function () {
      return new Promise(function () {});
    });
    expect(run({
      internal: {
        mediaType: `text/x-foo`
      }
    })).toBeNull();
    expect(run({
      internal: {
        mediaType: `application/javascript`
      }
    })).toBeDefined();
    expect(run({
      internal: {
        mediaType: `text/jsx`
      }
    })).toBeDefined();
    expect(loadNodeContent.mock.calls).toHaveLength(2);
  });
  it(`should extract all components in a file`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    var types;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return run(node);

          case 2:
            types = (0, _lodash.groupBy)(createdNodes, function (n) {
              return n.internal.type;
            });
            expect(types.ComponentMetadata).toHaveLength(5);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it(`should give all components a name`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2() {
    var types;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return run(node);

          case 2:
            types = (0, _lodash.groupBy)(createdNodes, `internal.type`);
            expect(types.ComponentMetadata.every(function (c) {
              return c.displayName;
            })).toBe(true);

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
  it(`should infer a name`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3() {
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            node.__fixture = `unnamed.js`;
            node.absolutePath = _path.default.join(__dirname, `UnnamedExport`);
            _context3.next = 4;
            return run(node);

          case 4:
            expect(createdNodes[0].displayName).toEqual(`UnnamedExport`);

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));
  it(`should extract all propTypes`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee4() {
    var types;
    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return run(node);

          case 2:
            types = (0, _lodash.groupBy)(createdNodes, `internal.type`);
            expect(types.ComponentProp).toHaveLength(14);

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  })));
  it(`should extract create description nodes with markdown types`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee5() {
    var types;
    return _regenerator.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return run(node);

          case 2:
            types = (0, _lodash.groupBy)(createdNodes, `internal.type`);
            expect(types.ComponentDescription.every(function (d) {
              return d.internal.mediaType === `text/markdown`;
            })).toBe(true);

          case 4:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  })));
  it(`should allow specifying handlers`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee6() {
    var handler;
    return _regenerator.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            handler = jest.fn();
            _context6.next = 3;
            return run(node, {
              handlers: [handler]
            });

          case 3:
            expect(!!handler.mock.calls.length).toBe(true);

          case 4:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  })));
});