"use strict";

var path = require("path");

var getResourcesFromHTML = require("../get-resources-from-html");

var htmlPath = path.resolve(__dirname + "/index.html");
it("it extracts resources correctly", function () {
  var resources = getResourcesFromHTML(htmlPath);
  expect(resources).toMatchSnapshot();
});