var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var Promise = require(`bluebird`);

var _ = require(`lodash`);

var json2csv = require(`json2csv`);

var _require = require(`../gatsby-node`),
    onCreateNode = _require.onCreateNode;

describe(`Process  nodes correctly`, function () {
  var node = {
    id: `whatever`,
    parent: `SOURCE`,
    children: [],
    extension: `csv`,
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/csv`
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
    var fields, data, csv, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            fields = [`blue`, `funny`];
            data = [{
              blue: true,
              funny: `yup`
            }, {
              blue: false,
              funny: `nope`
            }];
            csv = json2csv({
              data: data,
              fields: fields
            });
            node.content = csv;
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context.next = 9;
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

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it(`correctly handles the options object that is passed to it`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2() {
    var createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            node.content = `blue,funny\ntrue,yup\nfalse,nope`;
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context2.next = 6;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            }, {
              noheader: true
            }).then(function () {
              expect(createNode.mock.calls).toMatchSnapshot();
              expect(createParentChildLink.mock.calls).toMatchSnapshot();
              expect(createNode).toHaveBeenCalledTimes(3);
              expect(createParentChildLink).toHaveBeenCalledTimes(3);
            });

          case 6:
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
    var fields, data, csv, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            fields = [`id`, `blue`, `funny`];
            data = [{
              id: `foo`,
              blue: true,
              funny: `yup`
            }, {
              blue: false,
              funny: `nope`
            }];
            csv = json2csv({
              data: data,
              fields: fields
            });
            node.content = csv;
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context3.next = 9;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            }).then(function () {
              expect(createNode.mock.calls[0][0].id).toEqual(`foo`);
            });

          case 9:
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
    var fields, data, csv, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            fields = [`id`, `blue`, `funny`];
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
            csv = json2csv({
              data: data,
              fields: fields
            });
            node.content = csv;
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context4.next = 9;
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

          case 9:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  })));
});