/* eslint-disable no-console */
const webpack = require("webpack");
const MemoryFS = require("memory-fs");
const StaticSiteGeneratorPlugin = require("static-site-generator-webpack-plugin");
const { cloneDeep } = require("lodash");

module.exports = mdxBody => wConfig => {
  const webpackConfig = cloneDeep(wConfig);
  webpackConfig.externals = undefined;
  webpackConfig.entry = require.resolve("./wrap-root-render-html-entry.js");
  webpackConfig.output = {
    filename: "output.txt",
    path: "/",
    libraryTarget: "commonjs"
  };
  webpackConfig.plugins.push(
    new StaticSiteGeneratorPlugin({
      paths: ["/"],
      locals: {
        // Properties here are merged into `locals`
        // passed to the exported render function
        mdxBody
      },
      globals: {
        window: {},
        __MDX_CONTENT__: mdxBody
      }
    })
  );
  const fs = new MemoryFS();
  const compiler = webpack(webpackConfig);
  compiler.outputFileSystem = fs;
  return new Promise(resolve => {
    compiler.run((err, stats) => {
      // error handling bonanza
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors);
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }

      // actual code
      const content = fs.readFileSync("/index.html", "utf-8");
      resolve(content);
    });
  });
};
