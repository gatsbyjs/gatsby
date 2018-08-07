"use strict";

var cheerio = require("cheerio");

var path = require("path");

var fs = require("fs");

var _ = require("lodash");

module.exports = function (htmlPath) {
  // load index.html to pull scripts/links necessary for proper offline reload
  var html = fs.readFileSync(path.resolve(htmlPath)); // party like it's 2006

  var $ = cheerio.load(html); // holds any paths for scripts and links

  var criticalFilePaths = [];
  $("script[src], link[as=script]").each(function (_, elem) {
    var $elem = $(elem);
    var url = $elem.attr("src") || $elem.attr("href");
    var blackListRegex = /\.xml$/;

    if (!blackListRegex.test(url)) {
      criticalFilePaths.push("public" + url);
    }
  });
  return _.uniq(criticalFilePaths);
};