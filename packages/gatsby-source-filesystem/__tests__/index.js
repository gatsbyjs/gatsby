var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var path = require(`path`);

var _require = require(`../`),
    loadNodeContent = _require.loadNodeContent;

describe(`gatsby-source-filesystem`, function () {
  it(`can load the content of a file`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee() {
    var content;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return loadNodeContent({
              absolutePath: path.join(__dirname, `../index.js`)
            });

          case 2:
            content = _context.sent;
            expect(content.length).toBeGreaterThan(0);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it(`rejects if file not found`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee2() {
    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return loadNodeContent({
              absolutePath: path.join(__dirname, `haha-not-a-real-file.js`)
            }).catch(function (err) {
              expect(err).toBeDefined();
            });

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
});