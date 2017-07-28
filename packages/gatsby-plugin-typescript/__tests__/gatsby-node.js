"use strict";

var _require = require("../gatsby-node"),
    resolvableExtensions = _require.resolvableExtensions,
    modifyWebpackConfig = _require.modifyWebpackConfig,
    preprocessSource = _require.preprocessSource;

describe("gatsby-plugin-typescript", function () {
  it("returns correct extensions", function () {
    expect(resolvableExtensions()).toMatchSnapshot();
  });

  it("modifies webpack config", function () {
    var config = {
      loader: jest.fn()
    };

    modifyWebpackConfig({ config: config }, { compilerOptions: {} });

    expect(config.loader).toHaveBeenCalledTimes(1);
    var lastCall = config.loader.mock.calls.pop();
    expect(lastCall).toMatchSnapshot();
  });

  describe("pre-processing", function () {
    var opts = { compilerOptions: {} };
    it("leaves non-tsx? files alone", function () {
      expect(preprocessSource({
        contents: "alert('hello');",
        filename: "test.js"
      }, opts)).toBeNull();
    });

    it("transforms .ts files", function () {
      var js = preprocessSource({
        filename: "index.ts",
        contents: "\n          declare let moment: any;\n\n          const now: string = moment().format('HH:MM:ss');\n        "
      }, opts);
      expect(js).not.toBeNull();
      expect(js).toMatchSnapshot();
    });

    it("transforms JSX files", function () {
      var js = preprocessSource({
        filename: "tags.ts",
        contents: "\n          import * as React from 'react';\n\n          export default () => <h1>Hello World</h1>;\n        "
      }, opts);

      expect(js).not.toBeNull();
      expect(js).toMatchSnapshot();
    });
  });
});