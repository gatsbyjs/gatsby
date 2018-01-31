var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var Promise = require(`bluebird`);

var _require = require(`../gatsby-node`),
    onCreateNode = _require.onCreateNode;

describe(`Process XML nodes correctly`, function () {
  var node = {
    name: `nodeName`,
    id: `whatever`,
    parent: `SOURCE`,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `application/xml`,
      name: `test`
    } // Make some fake functions its expecting.

  };
  node.content = `
      <?xml version="1.0"?>
      <catalog>
        <book id="bk101">
            <author>Gambardella, Matthew</author>
            <title>XML Developer's Guide</title>
            <genre>Computer</genre>
            <price>44.95</price>
            <publish_date>2000-10-01</publish_date>
            <description>An in-depth look at creating applications
            with XML.</description>
         </book>
         <book id="bk102">
            <author>Ralls, Kim</author>
            <title>Midnight Rain</title>
            <genre>Fantasy</genre>
            <price>5.95</price>
            <publish_date>2000-12-16</publish_date>
            <description>A former architect battles corporate zombies,
            an evil sorceress, and her own childhood to become queen
            of the world.</description>
         </book>
      </catalog>
    `;

  var loadNodeContent = function loadNodeContent(node) {
    return Promise.resolve(node.content);
  };

  it(`correctly creates nodes from XML`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee() {
    var createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context.next = 5;
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

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it(`should set the node id to the attribute id if specified`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2() {
    var createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context2.next = 5;
            return onCreateNode({
              node,
              loadNodeContent,
              actions
            }).then(function () {
              expect(createNode.mock.calls[0][0].id).toEqual(`bk101`);
            });

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
});