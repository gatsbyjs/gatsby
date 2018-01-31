var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

var path = require(`path`);

var _require = require(`../`),
    base64 = _require.base64,
    responsiveSizes = _require.responsiveSizes,
    resolutions = _require.resolutions;

describe(`gatsby-plugin-sharp`, function () {
  var args = {
    duotone: false,
    grayscale: false,
    rotate: false
  };
  var absolutePath = path.join(__dirname, `images/test.png`);
  var file = getFileObject(absolutePath);
  describe(`responsiveSizes`, function () {
    it(`includes responsive image properties, e.g. sizes, srcset, etc.`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee() {
      var result;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return responsiveSizes({
                file
              });

            case 2:
              result = _context.sent;
              expect(result).toMatchSnapshot();

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    })));
    it(`adds pathPrefix if defined`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee2() {
      var pathPrefix, result;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              pathPrefix = `/blog`;
              _context2.next = 3;
              return responsiveSizes({
                file,
                args: {
                  pathPrefix
                }
              });

            case 3:
              result = _context2.sent;
              expect(result.src.indexOf(pathPrefix)).toBe(0);
              expect(result.srcSet.indexOf(pathPrefix)).toBe(0);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    })));
    it(`keeps original file name`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee3() {
      var result;
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return responsiveSizes({
                file
              });

            case 2:
              result = _context3.sent;
              expect(result.src.indexOf(file.name)).toBe(8);
              expect(result.srcSet.indexOf(file.name)).toBe(8);

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    })));
    it(`accounts for pixel density`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee4() {
      var result;
      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return responsiveSizes({
                file: getFileObject(path.join(__dirname, `images/144-density.png`)),
                args: {
                  sizeByPixelDensity: true
                }
              });

            case 2:
              result = _context4.sent;
              expect(result).toMatchSnapshot();

            case 4:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    })));
    it(`can optionally ignore pixel density`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee5() {
      var result;
      return _regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return responsiveSizes({
                file: getFileObject(path.join(__dirname, `images/144-density.png`)),
                args: {
                  sizeByPixelDensity: false
                }
              });

            case 2:
              result = _context5.sent;
              expect(result).toMatchSnapshot();

            case 4:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    })));
    it(`does not change the arguments object it is given`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee6() {
      var args;
      return _regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              args = {
                maxWidth: 400
              };
              _context6.next = 3;
              return responsiveSizes({
                file,
                args
              });

            case 3:
              expect(args).toEqual({
                maxWidth: 400
              });

            case 4:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    })));
  });
  describe(`resolutions`, function () {
    console.warn = jest.fn();
    beforeEach(function () {
      console.warn.mockClear();
    });
    afterAll(function () {
      console.warn.mockClear();
    });
    it(`does not warn when the requested width is equal to the image width`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee7() {
      var args, result;
      return _regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              args = {
                width: 1
              };
              _context7.next = 3;
              return resolutions({
                file,
                args
              });

            case 3:
              result = _context7.sent;
              expect(result.width).toEqual(1);
              expect(console.warn).toHaveBeenCalledTimes(0);

            case 6:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, this);
    })));
    it(`warns when the requested width is greater than the image width`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee8() {
      var args, result;
      return _regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              args = {
                width: 2
              };
              _context8.next = 3;
              return resolutions({
                file,
                args
              });

            case 3:
              result = _context8.sent;
              expect(result.width).toEqual(1);
              expect(console.warn).toHaveBeenCalledTimes(1);

            case 6:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8, this);
    })));
  });
  describe(`base64`, function () {
    it(`converts image to base64`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee9() {
      var result;
      return _regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return base64({
                file,
                args
              });

            case 2:
              result = _context9.sent;
              expect(result).toMatchSnapshot();

            case 4:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, this);
    })));
  });
});

function getFileObject(absolutePath) {
  return {
    id: `${absolutePath} absPath of file`,
    name: `test`,
    absolutePath,
    extension: `png`,
    internal: {
      contentDigest: `1234`
    }
  };
}