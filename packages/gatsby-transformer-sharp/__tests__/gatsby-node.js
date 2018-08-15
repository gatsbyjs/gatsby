"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

const _require = require(`../gatsby-node`),
      onCreateNode = _require.onCreateNode;

describe(`Process image nodes correctly`, () => {
  it(`correctly creates an ImageSharp node from a file image node`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    const node = {
      extension: `png`,
      id: `whatever`,
      children: [],
      internal: {
        contentDigest: `whatever`
      }
    };
    const createNode = jest.fn();
    const createParentChildLink = jest.fn();
    const actions = {
      createNode,
      createParentChildLink
    };
    const createNodeId = jest.fn();
    createNodeId.mockReturnValue(`uuid-from-gatsby`);
    yield onCreateNode({
      node,
      actions,
      createNodeId
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot();
      expect(createParentChildLink.mock.calls).toMatchSnapshot();
      expect(createNode).toHaveBeenCalledTimes(1);
      expect(createParentChildLink).toHaveBeenCalledTimes(1);
    });
  }));
});