"use strict";

var path = require("path");

var _require = require("../common"),
    defaultIcons = _require.defaultIcons,
    doesIconExist = _require.doesIconExist;

describe("gatsby-plugin-manifest", function () {
  describe("defaultIcons", function () {
    it("includes all icon sizes", function () {
      expect(defaultIcons).toMatchSnapshot();
    });
  });
  describe("doesIconExist", function () {
    it("returns true if image exists on filesystem", function () {
      var iconSrc = path.resolve(__dirname, "./images/gatsby-logo.png");
      expect(doesIconExist(iconSrc)).toBeTruthy();
    });
    it("returns false if image does not exist on filesystem", function () {
      var iconSrc = path.resolve(__dirname, "./images/non-existent-logo.png");
      expect(doesIconExist(iconSrc)).toBeFalsy();
    });
  });
});