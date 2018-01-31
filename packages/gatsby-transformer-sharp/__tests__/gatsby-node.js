var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var _require = require(`../gatsby-node`),
    onCreateNode = _require.onCreateNode;

describe(`Process image nodes correctly`, function () {
  it(`correctly creates an ImageSharp node from a file image node`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee() {
    var node, createNode, createParentChildLink, actions;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            node = {
              extension: `png`,
              id: `whatever`,
              children: [],
              internal: {
                contentDigest: `whatever`
              }
            };
            createNode = jest.fn();
            createParentChildLink = jest.fn();
            actions = {
              createNode,
              createParentChildLink
            };
            _context.next = 6;
            return onCreateNode({
              node,
              actions
            }).then(function () {
              expect(createNode.mock.calls).toMatchSnapshot();
              expect(createParentChildLink.mock.calls).toMatchSnapshot();
              expect(createNode).toHaveBeenCalledTimes(1);
              expect(createParentChildLink).toHaveBeenCalledTimes(1);
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
});