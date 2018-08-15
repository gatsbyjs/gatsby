"use strict";

var validatePath = require("../validate-path");

var createPath = require("../create-path");

describe("JavaScript page creator", function () {
  it("filters out files that start with underscores", function () {
    var files = [{
      path: "something/blah.js"
    }, {
      path: "something/_blah.js"
    }, {
      path: "_blah.js"
    }];
    expect(files.filter(function (file) {
      return validatePath(file.path);
    }).length).toEqual(1);
  });
  it("filters out files that start with template-*", function () {
    var files = [{
      path: "something/blah.js"
    }, {
      path: "something/template-cool-page-type.js"
    }, {
      path: "template-cool-page-type.js"
    }];
    expect(files.filter(function (file) {
      return validatePath(file.path);
    }).length).toEqual(1);
  });
  it("filters out files that have TypeScript declaration extensions", function () {
    var files = [{
      path: "something/foo.ts"
    }, {
      path: "something/bar.tsx"
    }, {
      path: "something/declaration-file.d.ts"
    }, {
      path: "something-else/other-declaration-file.d.tsx"
    }];
    expect(files.filter(function (file) {
      return validatePath(file.path);
    }).length).toEqual(2);
  });
  it("filters out test files", function () {
    var files = [{
      path: "__tests__/something.test.js"
    }, {
      path: "foo.spec.js"
    }, {
      path: "bar.test.js"
    }, {
      path: "page.js"
    }, {
      path: "page.jsx"
    }];
    expect(files.filter(function (file) {
      return validatePath(file.path);
    }).length).toEqual(2);
  });
  describe("create-path", function () {
    it("should create unix paths", function () {
      var basePath = "/a/";
      var paths = ["/a/b/c/de", "/a/bee", "/a/b/d/c/"];
      expect(paths.map(function (p) {
        return createPath(basePath, p);
      })).toMatchSnapshot();
    });
    it("should deal with windows paths", function () {
      var basePath = "D:/Projets/gatsby-starter/src/pages";
      var paths = ["D:\\Projets\\gatsby-starter\\src\\pages\\404.tsx", "D:\\Projets\\gatsby-starter\\src\\pages\\index.tsx", "D:\\Projets\\gatsby-starter\\src\\pages\\blog.tsx"];
      expect(paths.map(function (p) {
        return createPath(basePath, p);
      })).toMatchSnapshot();
    });
  });
});