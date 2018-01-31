var _regeneratorRuntime = require("@babel/runtime/regenerator");

var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");

jest.mock(`fs-extra`, function () {
  return {
    existsSync: function existsSync() {
      return false;
    },
    copy: jest.fn(),
    ensureDir: jest.fn()
  };
});

var Remark = require(`remark`);

var fsExtra = require(`fs-extra`);

var path = require(`path`);

var plugin = require(`../`);

var remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true
});

var imageURL = function imageURL(markdownAST) {
  return markdownAST.children[0].children[0].url;
};

describe(`gatsby-remark-copy-linked-files`, function () {
  afterEach(function () {
    fsExtra.copy.mockReset();
  });
  var markdownNode = {
    parent: {}
  };

  var getNode = function getNode() {
    return {
      dir: ``,
      internal: {
        type: `File`
      }
    };
  };

  var getFiles = function getFiles(filePath) {
    return [{
      absolutePath: path.posix.normalize(filePath),
      internal: {},
      extension: filePath.split(`.`).pop().trim()
    }];
  };

  describe(`images`, function () {
    ;
    [`svg`, `gif`].forEach(function (extension) {
      it(`can copy .${extension}`,
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee() {
        var path, markdownAST;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                path = `images/sample-image.${extension}`;
                markdownAST = remark.parse(`![some image](${path})`);
                _context.next = 4;
                return plugin({
                  files: getFiles(path),
                  markdownAST,
                  markdownNode,
                  getNode
                });

              case 4:
                expect(fsExtra.copy).toHaveBeenCalledWith(expect.any(String), expect.any(String));

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      })));
    });
    [`png`, `jpg`, `jpeg`].forEach(function (extension) {
      it(`ignores images with .${extension}`,
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      _regeneratorRuntime.mark(function _callee2() {
        var path, markdownAST;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                path = `images/sample-image.${extension}`;
                markdownAST = remark.parse(`![some image](${path})`);
                _context2.next = 4;
                return plugin({
                  files: getFiles(path),
                  markdownAST,
                  markdownNode,
                  getNode
                });

              case 4:
                expect(fsExtra.copy).not.toHaveBeenCalled();

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      })));
    });
  });
  it(`can copy file links`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee3() {
    var path, markdownAST;
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            path = `files/sample-file.txt`;
            markdownAST = remark.parse(`[path to file](${path})`);
            _context3.next = 4;
            return plugin({
              files: getFiles(path),
              markdownAST,
              markdownNode,
              getNode
            });

          case 4:
            expect(fsExtra.copy).toHaveBeenCalled();

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));
  it(`can copy HTML file links`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee4() {
    var path, markdownAST;
    return _regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            path = `files/sample-file.txt`;
            markdownAST = remark.parse(`<a href="${path}">link to file</a>`);
            _context4.next = 4;
            return plugin({
              files: getFiles(path),
              markdownAST,
              markdownNode,
              getNode
            });

          case 4:
            expect(fsExtra.copy).toHaveBeenCalled();

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  })));
  it(`can copy HTML images`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee5() {
    var path, markdownAST;
    return _regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            path = `images/sample-image.gif`;
            markdownAST = remark.parse(`<img src="${path}">`);
            _context5.next = 4;
            return plugin({
              files: getFiles(path),
              markdownAST,
              markdownNode,
              getNode
            });

          case 4:
            expect(fsExtra.copy).toHaveBeenCalled();

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  })));
  it(`can copy HTML multiple images`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee6() {
    var path1, path2, markdownAST;
    return _regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            path1 = `images/sample-image.gif`;
            path2 = `images/another-sample-image.gif`;
            markdownAST = remark.parse(`<div><img src="${path1}"><img src="${path2}"></div>`);
            _context6.next = 5;
            return plugin({
              files: getFiles(path1).concat(getFiles(path2)),
              markdownAST,
              markdownNode,
              getNode
            });

          case 5:
            expect(fsExtra.copy).toHaveBeenCalledTimes(2);

          case 6:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  })));
  it(`can copy HTML videos`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee7() {
    var path, markdownAST;
    return _regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            path = `videos/sample-video.mp4`;
            markdownAST = remark.parse(`<video controls="controls" autoplay="true" loop="true">\n<source type="video/mp4" src="${path}"></source>\n<p>Your browser does not support the video element.</p>\n</video>`);
            _context7.next = 4;
            return plugin({
              files: getFiles(path),
              markdownAST,
              markdownNode,
              getNode
            });

          case 4:
            expect(fsExtra.copy).toHaveBeenCalled();

          case 5:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, this);
  })));
  it(`leaves HTML nodes alone`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee8() {
    var openingTag, markdownAST;
    return _regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            openingTag = `<a href="http://example.com/">`;
            markdownAST = remark.parse(`${openingTag}Link to example.com</a>`);
            _context8.next = 4;
            return plugin({
              markdownAST,
              markdownNode,
              getNode
            }).then(function () {
              // we expect the resulting markdownAST to consist
              // of a paragraph with three children:
              // openingTag, text, and closing tag
              expect(markdownAST.children[0].children[0].value).toBe(openingTag);
            });

          case 4:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  })));
  it(`leaves absolute file paths alone`,
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee9() {
    var path, markdownAST;
    return _regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            path = `https://google.com/images/sample-image.gif`;
            markdownAST = remark.parse(`![some absolute image](${path})`);
            _context9.next = 4;
            return plugin({
              files: getFiles(path),
              markdownAST,
              markdownNode,
              getNode
            });

          case 4:
            expect(fsExtra.copy).not.toHaveBeenCalled();

          case 5:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  })));
  describe(`options.destinationDir`, function () {
    var imagePath = `images/sample-image.gif`;
    it(`throws an error if the destination directory is not within 'public'`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee10() {
      var markdownAST, invalidDestinationDir;
      return _regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              markdownAST = remark.parse(`![some absolute image](${imagePath})`);
              invalidDestinationDir = `../destination`;
              expect.assertions(2);
              return _context10.abrupt("return", plugin({
                files: getFiles(imagePath),
                markdownAST,
                markdownNode,
                getNode
              }, {
                destinationDir: invalidDestinationDir
              }).catch(function (e) {
                expect(e).toEqual(expect.stringContaining(invalidDestinationDir));
                expect(fsExtra.copy).not.toHaveBeenCalled();
              }));

            case 4:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    })));
    it(`copies file to destinationDir when supplied`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee11() {
      var markdownAST, validDestinationDir, expectedNewPath;
      return _regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              markdownAST = remark.parse(`![some absolute image](${imagePath})`);
              validDestinationDir = `path/to/dir`;
              expectedNewPath = path.posix.join(process.cwd(), `public`, validDestinationDir, `/undefined-undefined.gif`);
              expect.assertions(3);
              _context11.next = 6;
              return plugin({
                files: getFiles(imagePath),
                markdownAST,
                markdownNode,
                getNode
              }, {
                destinationDir: validDestinationDir
              }).then(function (v) {
                expect(v).toBeDefined();
                expect(fsExtra.copy).toHaveBeenCalledWith(imagePath, expectedNewPath);
                expect(imageURL(markdownAST)).toEqual(`/path/to/dir/undefined-undefined.gif`);
              });

            case 6:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, this);
    })));
    it(`copies file to root dir when not supplied'`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee12() {
      var markdownAST, expectedNewPath;
      return _regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              markdownAST = remark.parse(`![some absolute image](${imagePath})`);
              expectedNewPath = path.posix.join(process.cwd(), `public`, `/undefined-undefined.gif`);
              expect.assertions(3);
              _context12.next = 5;
              return plugin({
                files: getFiles(imagePath),
                markdownAST,
                markdownNode,
                getNode
              }).then(function (v) {
                expect(v).toBeDefined();
                expect(fsExtra.copy).toHaveBeenCalledWith(imagePath, expectedNewPath);
                expect(imageURL(markdownAST)).toEqual(`/undefined-undefined.gif`);
              });

            case 5:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12, this);
    })));
  });
  describe(`options.ignoreFileExtensions`, function () {
    var pngImagePath = `images/sample-image.png`;
    var jpgImagePath = `images/sample-image.jpg`;
    var jpegImagePath = `images/sample-image.jpeg`;
    var bmpImagePath = `images/sample-image.bmp`;
    var tiffImagePath = `images/sample-image.tiff`;
    it(`optionally copies PNG, JPG/JPEG, BPM and TIFF files`,
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee13() {
      var markdownAST;
      return _regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              markdownAST = remark.parse(`![PNG](${pngImagePath}) ![JPG](${jpgImagePath}) ![JPEG](${jpegImagePath}) ![BPM](${bmpImagePath}) ![TIFF](${tiffImagePath})`);
              _context13.next = 3;
              return plugin({
                files: getFiles(pngImagePath).concat(getFiles(jpgImagePath), getFiles(jpegImagePath), getFiles(bmpImagePath), getFiles(tiffImagePath)),
                markdownAST,
                markdownNode,
                getNode
              }, {
                ignoreFileExtensions: []
              });

            case 3:
              expect(fsExtra.copy).toHaveBeenCalledTimes(5);

            case 4:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, this);
    })));
  });
});