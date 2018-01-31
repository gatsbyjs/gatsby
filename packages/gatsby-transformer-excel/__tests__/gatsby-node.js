var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var Promise = require(`bluebird`);

var _ = require(`lodash`);

var XLSX = require(`xlsx`);

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
    var data, csv, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            data = [[`blue`, `funny`], [true, `yup`], [false, `nope`]];
            csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(data, {
              raw: true
            }));
            node.content = csv;
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context.next = 8;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            }).then(function () {
              expect(createNode.mock.calls).toMatchSnapshot();
              expect(createParentChildLink.mock.calls).toMatchSnapshot();
              expect(createNode).toHaveBeenCalledTimes(2 + 1);
              expect(createParentChildLink).toHaveBeenCalledTimes(2 + 1);
            });

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it(`If the object has an id, it uses that as the id instead of the auto-generated one`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2() {
    var data, csv, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            data = [[`id`, `blue`, `funny`], [`foo`, true, `yup`], [void 0, false, `nope`]];
            csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(data, {
              raw: true
            }));
            node.content = csv;
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
              expect(createNode.mock.calls[0][0].id).toEqual(`foo`);
            });

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
  it(`the different objects shouldn't get the same ID even if they have the same content`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee3() {
    var data, csv, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            data = [[`id`, `blue`, `funny`, `green`], [`foo`, true, `yup`], [void 0, false, `nope`], [void 0, false, `nope`], [void 0, void 0, `nope`, false]];
            csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(data, {
              raw: true
            }));
            node.content = csv;
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context3.next = 8;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            }).then(function () {
              var ids = createNode.mock.calls.map(function (object) {
                return object[0].id;
              }); // Test that they're unique

              expect(_.uniq(ids).length).toEqual(4 + 1);
            });

          case 8:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));
});