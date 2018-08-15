"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

const path = require(`path`);

const _require = require(`../`),
      loadNodeContent = _require.loadNodeContent;

describe(`gatsby-source-filesystem`, () => {
  it(`can load the content of a file`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    const content = yield loadNodeContent({
      absolutePath: path.join(__dirname, `../index.js`)
    });
    expect(content.length).toBeGreaterThan(0);
  }));
  it(`rejects if file not found`,
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(function* () {
    yield loadNodeContent({
      absolutePath: path.join(__dirname, `haha-not-a-real-file.js`)
    }).catch(err => {
      expect(err).toBeDefined();
    });
  }));
});