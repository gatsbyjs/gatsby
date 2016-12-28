"use strict";

var sharp = require(`sharp`);
var qs = require(`qs`);
var imageSize = require(`image-size`);
var _ = require(`lodash`);
var Promise = require(`bluebird`);
var fs = require(`fs`);

var toProcess = [];

var processJobs = function processJobs(jobs, count) {
  console.time(`processing images`);
  Promise.all(_.values(jobs).map(function (job) {
    return job.outsideResolve;
  })).then(function () {
    return console.timeEnd(`processing images`);
  });
  console.log("");
  console.log(`processing ${ count } jobs!`);
  console.log(jobs);
  console.log("");
  _.each(jobs, function (fileJobs, file) {
    var pipeline = sharp(file).rotate().withoutEnlargement();
    _.each(fileJobs, function (job) {
      // Move job processing to own function so can call it
      // directly to get a base64 version of a file.
      var args = job.args;
      var clonedPipeline = void 0;
      if (fileJobs.length > 1) {
        clonedPipeline = pipeline.clone();
      } else {
        clonedPipeline = pipeline;
      }
      clonedPipeline.resize(args.width, args.height)
      // TODO compress pngs with imagemin-pngquant as libvps doesn't do
      // lossy compression for pngs.
      //
      // TODO create gatsby-typegen-remark-resize-images which
      // goes through each image and creates images at
      // 2000, 1500, 1000, 500 and changes image to use srcset (in ast)
      // with explicit height/width. Make a sharp utils module
      // which has the processing queue + immediate mode (for base64)
      // so that anyone who wants to use image resizing can.
      .png({
        compressionLevel: args.pngCompressionLevel,
        adaptiveFiltering: false,
        force: false
      }).jpeg({
        quality: args.jpegQuality,
        progressive: args.jpegProgressive,
        force: false
      });

      // grayscale
      if (args.grayscale) {
        clonedPipeline = clonedPipeline.grayscale();
      }

      // rotate
      if (args.rotate) {
        clonedPipeline = clonedPipeline.rotate(args.rotate);
      }

      if (args.base64) {
        clonedPipeline.toBuffer(function (err, data) {
          resolve({
            src: data.toString(`base64`),
            width: args.width
          });
        });
      } else {
        clonedPipeline.toFile(job.outputPath).then(function () {
          return job.outsideResolve();
        });
      }
    });
  });
};

var debouncedProcess = _.debounce(function () {
  // Filter out jobs for images that have already been created.
  var filteredJobs = toProcess.filter(function (job) {
    return !fs.existsSync(job.outputPath);
  });
  var count = filteredJobs.length;

  // Group jobs by inputPath so Sharp can reuse work.
  var groupedJobs = _.groupBy(filteredJobs, function (job) {
    return job.inputPath;
  });

  // Delete old jobs
  toProcess.length = 0;

  processJobs(groupedJobs, count);
}, 250);

module.exports = function (_ref, cb) {
  var file = _ref.file,
      args = _ref.args;

  var imgSrc = `/${ file.hash }-${ qs.stringify(args) }.${ file.extension }`;
  var filePath = `${ process.cwd() }/public${ imgSrc }`;
  // Create function to call when the image is finished.
  var outsideResolve = void 0;
  var finished = new Promise(function (resolve) {
    outsideResolve = resolve;
  });

  var width = void 0;
  var height = void 0;
  var aspectRatio = void 0;
  // Calculate the eventual width/height of the image.
  imageSize(file.id, function (err, dimensions) {
    aspectRatio = dimensions.width / dimensions.height;

    // We don't allow enlargement so if either the requested height or
    // width is larger, we just return things as they are.
    if (args.width > dimensions.width || args.height > dimensions.height) {
      width = dimensions.width;
      height = dimensions.height;

      // If the width/height are both set, we're cropping so just return
      // that.
    } else if (args.width && args.height) {
      width = args.width;
      height = args.height;
    } else {

      // Use the aspect ratio of the image to calculate the resulting
      // height.
      width = args.width;
      height = args.width / aspectRatio;
    }

    // Create job and process.
    var job = {
      file,
      args,
      outsideResolve,
      inputPath: file.id,
      outputPath: filePath
    };
    toProcess.push(job);
    debouncedProcess();

    return cb({
      src: imgSrc,
      absolutePath: filePath,
      width,
      height,
      aspectRatio,
      finished
    });
  });
};