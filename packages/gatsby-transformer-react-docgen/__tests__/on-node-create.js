"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _lodash = require("lodash");

var _onNodeCreate = _interopRequireDefault(require("../on-node-create"));

const readFile = file => new Promise((y, n) => {
  _fs.default.readFile(_path.default.join(__dirname, `fixtures`, file), `utf8`, (err, content) => err ? n(err) : y(content));
});

describe(`transformer-react-doc-gen: onCreateNode`, () => {
  let loadNodeContent, actions, node, createdNodes, updatedNodes;
  const createNodeId = jest.fn();
  createNodeId.mockReturnValue(`uuid-from-gatsby`);

  let run = (node, opts = {}) => (0, _onNodeCreate.default)({
    node,
    loadNodeContent,
    actions,
    createNodeId,
    reporter: {
      error: console.error
    }
  }, opts);

  beforeEach(() => {
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
    loadNodeContent = jest.fn(node => readFile(node.__fixture));
    actions = {
      createNode: jest.fn(n => createdNodes.push(n)),
      createParentChildLink: jest.fn(n => updatedNodes.push(n))
    };
  });
  it(`should only process javascript and jsx nodes`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    loadNodeContent = jest.fn(() => new Promise(() => {}));
    expect((yield run({
      internal: {
        mediaType: `text/x-foo`
      }
    }))).toBeUndefined();
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
  }));
  it(`should extract all components in a file`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    yield run(node);
    let types = (0, _lodash.groupBy)(createdNodes, n => n.internal.type);
    expect(types.ComponentMetadata).toHaveLength(6);
  }));
  it(`should give all components a name`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    yield run(node);
    let types = (0, _lodash.groupBy)(createdNodes, `internal.type`);
    expect(types.ComponentMetadata.map(c => c.displayName)).toEqual([`Baz`, `Buz`, `Foo`, `Baz.Foo`, `Bar`, `Qux`]);
  }));
  it(`should infer a name`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    node.__fixture = `unnamed.js`;
    node.absolutePath = _path.default.join(__dirname, `UnnamedExport`);
    yield run(node);
    expect(createdNodes[0].displayName).toEqual(`UnnamedExport`);
  }));
  it(`should extract all propTypes`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    yield run(node);
    let types = (0, _lodash.groupBy)(createdNodes, `internal.type`);
    expect(types.ComponentProp).toHaveLength(14);
  }));
  it(`should delicately remove doclets`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    yield run(node);
    let types = (0, _lodash.groupBy)(createdNodes, `internal.type`);
    expect(types.ComponentProp[0].description).toEqual(`An object hash of field (fix this @mention?) errors for the form.`);
    expect(types.ComponentProp[0].doclets).toEqual({
      type: `{Foo}`,
      default: `blue`
    });
  }));
  it(`should extract create description nodes with markdown types`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    yield run(node);
    let types = (0, _lodash.groupBy)(createdNodes, `internal.type`);
    expect(types.ComponentDescription.every(d => d.internal.mediaType === `text/markdown`)).toBe(true);
  }));
  it(`should allow specifying handlers`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    let handler = jest.fn();
    yield run(node, {
      handlers: [handler]
    });
    expect(!!handler.mock.calls.length).toBe(true);
  }));
  describe(`flowTypes`, () => {
    beforeEach(() => {
      node.__fixture = `flow.js`;
    });
    it(`should add flow type info`,
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(function* () {
      yield run(node);
      const created = createdNodes.find(f => !!f.flowType);
      expect(created.flowType).toEqual({
        name: `number`
      });
    }));
  });
});