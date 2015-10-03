import generateStaticPages from './static-generation';
import buildProductionBundle from './build-production';
import postBuild from './post-build';
import globPages from './glob-pages';

module.exports = function(program) {
  var {directory} = program;
  try {
    var customPostBuild = require(directory + "/post-build");
  } catch (e) {
  }

  console.log("Generating static html pages");
  return generateStaticPages(program, function(err, stats) {
    if (err) {
      console.log("failed at generating static html pages");
      return console.log(err);
    }
    console.log("Compiling production bundle.js");
    return buildProductionBundle(program, function(err, stats) {
      if (err) {
        console.log("failed to compile bundle.js");
        return console.log(err);
      }
      console.log("Copying assets");
      return postBuild(program, function(err, results) {
        if (err) {
          console.log("failed to copy assets");
          return console.log(err);
        }
        if ((typeof customPostBuild !== "undefined" && customPostBuild !== null)) {
          console.log("Performing custom post-build steps");
          return globPages(directory, function(err, pages) {
            return customPostBuild(pages, function(err) {
              return console.log('Done');
            });
          });
        }
      });
    });
  });
};
