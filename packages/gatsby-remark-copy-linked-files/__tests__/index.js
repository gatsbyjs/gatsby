"use strict";

jest.mock(`fs-extra`, function () {
  return {
    existsSync: function existsSync() {
      return false;
    },
    copy: jest.fn()
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
      absolutePath: path.normalize(filePath),
      internal: {},
      extension: filePath.split(`.`).pop().trim()
    }];
  };

  describe(`images`, function () {
    ;[`svg`, `gif`].forEach(function (extension) {
      it(`can copy .${extension}`, function () {
        var path = `images/sample-image.${extension}`;
        var markdownAST = remark.parse(`![some image](${path})`);

        plugin({ files: getFiles(path), markdownAST, markdownNode, getNode });

        expect(fsExtra.copy).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.any(Function));
      });
    });[`png`, `jpg`, `jpeg`].forEach(function (extension) {
      it(`ignores images with .${extension}`, function () {
        var path = `images/sample-image.${extension}`;
        var markdownAST = remark.parse(`![some image](${path})`);

        plugin({ files: getFiles(path), markdownAST, markdownNode, getNode });

        expect(fsExtra.copy).not.toHaveBeenCalled();
      });
    });
  });

  it(`can copy file links`, function () {
    var path = `files/sample-file.txt`;

    var markdownAST = remark.parse(`[path to file](${path})`);

    plugin({ files: getFiles(path), markdownAST, markdownNode, getNode });

    expect(fsExtra.copy).toHaveBeenCalled();
  });

  it(`can copy HTML images`, function () {
    var path = `images/sample-image.gif`;

    var markdownAST = remark.parse(`<img src="${path}">`);

    plugin({ files: getFiles(path), markdownAST, markdownNode, getNode });

    expect(fsExtra.copy).toHaveBeenCalled();
  });

  it(`leaves absolute file paths alone`, function () {
    var path = `https://google.com/images/sample-image.gif`;

    var markdownAST = remark.parse(`![some absolute image](${path})`);

    plugin({ files: getFiles(path), markdownAST, markdownNode, getNode });

    expect(fsExtra.copy).not.toHaveBeenCalled();
  });
});