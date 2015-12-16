var generateStaticPages = require('./static-generation');
var buildProductionBundle = require('./build-production');
var postBuild = require('./post-build');
var globPages = require('./glob-pages');

module.exports = function(program, callback) {
  var directory = program.directory;
  try {
    var customPostBuild = require(directory + "/post-build");
  } catch (e) {
  }

  console.log("Generating static html pages");
  return generateStaticPages(program, function(err, stats) {
    if (err) {
      console.log("failed at generating static html pages");
      return callback(err);
    }
    console.log("Compiling production bundle.js");
    return buildProductionBundle(program, function(err, stats) {
      if (err) {
        console.log("failed to compile bundle.js");
        return callback(err);
      }
      console.log("Copying assets");
      return postBuild(program, function(err, results) {
        if (err) {
          console.log("failed to copy assets");
          return callback(err);
        }
        if ((typeof customPostBuild !== "undefined" && customPostBuild !== null)) {
          console.log("Performing custom post-build steps");
          return globPages(directory, function(err, pages) {
            return customPostBuild(pages, function(err) {
              return callback(null);
            });
          });
        } else {
          return callback(null);
        }
      });
    });
  });
};
