"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _groupBy = _interopRequireDefault(require("lodash/groupBy"));

var _path = _interopRequireDefault(require("path"));

var _gatsbyNode = _interopRequireDefault(require("../gatsby-node"));

describe(`transformer-react-doc-gen: onCreateNode`, () => {
  let actions, node, createdNodes, updatedNodes;
  const createNodeId = jest.fn();
  createNodeId.mockReturnValue(`uuid-from-gatsby`);

  let run = (node = node, opts = {}) => _gatsbyNode.default.onCreateNode({
    node,
    actions,
    createNodeId
  }, opts);

  beforeEach(() => {
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
      createNode: jest.fn(n => createdNodes.push(n)),
      createParentChildLink: jest.fn(n => updatedNodes.push(n))
    };
  });
  it(`should extract out a description, params, and examples`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    yield run(node);
    expect(createdNodes).toMatchSnapshot();
  }));
  it(`should only process javascript File nodes`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    let result;
    result = yield run({
      internal: {
        mediaType: `text/x-foo`
      }
    });
    expect(result).toBeNull();
    result = yield run({
      internal: {
        mediaType: `application/javascript`
      }
    });
    expect(result).toBeNull();
    result = yield run({
      id: `test`,
      children: [],
      absolutePath: _path.default.join(__dirname, `fixtures`, `code.js`),
      internal: {
        mediaType: `application/javascript`,
        type: `File`
      }
    });
    expect(createdNodes.length).toBeGreaterThan(0);
  }));
  it(`should extract create description nodes with markdown types`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    yield run(node);
    let types = (0, _groupBy.default)(createdNodes, `internal.type`);
    expect(types.DocumentationJSComponentDescription.every(d => d.internal.mediaType === `text/markdown`)).toBe(true);
  }));
});