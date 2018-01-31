var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var Promise = require(`bluebird`);

var yaml = require(`js-yaml`);

var _ = require(`lodash`);

var _require = require(`../gatsby-node`),
    onCreateNode = _require.onCreateNode;

describe(`Process YAML nodes correctly`, function () {
  var node = {
    id: `whatever`,
    parent: `SOURCE`,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/yaml`
    },
    name: `test` // Make some fake functions its expecting.

  };

  var loadNodeContent = function loadNodeContent(node) {
    return Promise.resolve(node.content);
  };

  it(`correctly creates nodes from JSON which is an array of objects`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee() {
    var data, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            data = [{
              blue: true,
              funny: `yup`
            }, {
              blue: false,
              funny: `nope`
            }];
            node.content = yaml.safeDump(data);
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context.next = 7;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            }).then(function () {
              expect(createNode.mock.calls).toMatchSnapshot();
              expect(createParentChildLink.mock.calls).toMatchSnapshot();
              expect(createNode).toHaveBeenCalledTimes(2);
              expect(createParentChildLink).toHaveBeenCalledTimes(2);
            });

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it(`correctly creates a node from JSON which is a single object`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2() {
    var data, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            data = {
              blue: true,
              funny: `yup`
            };
            node.content = yaml.safeDump(data);
            node.dir = `/tmp/bar/`;
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context2.next = 8;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            }).then(function () {
              expect(createNode.mock.calls).toMatchSnapshot();
              expect(createParentChildLink.mock.calls).toMatchSnapshot();
              expect(createNode).toHaveBeenCalledTimes(1);
              expect(createParentChildLink).toHaveBeenCalledTimes(1);
            });

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
  it(`If the object has an id, it uses that as the id instead of the auto-generated one`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee3() {
    var data, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            data = [{
              id: `foo`,
              blue: true,
              funny: `yup`
            }, {
              blue: false,
              funny: `nope`
            }];
            node.content = yaml.safeDump(data);
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context3.next = 7;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            }).then(function () {
              expect(createNode.mock.calls[0][0].id).toEqual(`foo`);
            });

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));
  it(`the different objects shouldn't get the same ID even if they have the same content`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee4() {
    var data, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            data = [{
              id: `foo`,
              blue: true,
              funny: `yup`
            }, {
              blue: false,
              funny: `nope`
            }, {
              blue: false,
              funny: `nope`
            }, {
              green: false,
              funny: `nope`
            }];
            node.content = yaml.safeDump(data);
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context4.next = 7;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            }).then(function () {
              var ids = createNode.mock.calls.map(function (object) {
                return object[0].id;
              }); // Test that they're unique

              expect(_.uniq(ids).length).toEqual(4);
            });

          case 7:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  })));
});