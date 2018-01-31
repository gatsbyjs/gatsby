jest.mock(`../resolve`, function () {
  return function (module) {
    return `/resolved/path/${module}`;
  };
});

var babelPluginRemoveQueries = require(`babel-plugin-remove-graphql-queries`);

var _require = require(`../gatsby-node`),
    resolvableExtensions = _require.resolvableExtensions,
    modifyWebpackConfig = _require.modifyWebpackConfig,
    preprocessSource = _require.preprocessSource;

describe(`gatsby-plugin-typescript`, function () {
  var args;

  function getLoader() {
    var call = args.actions.setWebpackConfig.mock.calls[0];
    return call[0].module.rules[0];
  }

  beforeEach(function () {
    var actions = {
      setWebpackConfig: jest.fn()
    };
    var loaders = {
      js: jest.fn(function () {
        return `babel-loader`;
      })
    };
    args = {
      actions,
      loaders
    };
  });
  it(`returns correct extensions`, function () {
    expect(resolvableExtensions()).toMatchSnapshot();
  });
  it(`modifies webpack config`, function () {
    var babelConfig = {
      plugins: [``]
    };
    var config = {
      loader: jest.fn()
    };
    modifyWebpackConfig({
      config,
      babelConfig
    }, {
      compilerOptions: {}
    });
    expect(args.actions.setWebpackConfig).toHaveBeenCalledTimes(1);
    var lastCall = args.actions.setWebpackConfig.mock.calls.pop();
    expect(lastCall).toMatchSnapshot();
  });
  it(`adds the remove graphql queries plugin`, function () {
    modifyWebpackConfig(args, {
      compilerOptions: {}
    });
    expect(args.loaders.js).toHaveBeenCalledTimes(1);
    var lastCall = args.loaders.js.mock.calls.pop();
    expect(lastCall[0]).toEqual({
      plugins: [babelPluginRemoveQueries]
    });
  });
  it(`passes the configuration to the ts-loader plugin`, function () {
    var babelConfig = {
      plugins: [``]
    };
    var config = {
      loader: jest.fn()
    };
    var options = {
      compilerOptions: {
        foo: `bar`
      },
      transpileOnly: false
    };
    modifyWebpackConfig({
      config,
      babelConfig
    }, options);
    var expectedOptions = {
      compilerOptions: {
        target: `esnext`,
        experimentalDecorators: true,
        jsx: `react`,
        foo: `bar`,
        module: `es6`
      },
      transpileOnly: false
    };
    expect(getLoader()).toEqual({
      test: /\.tsx?$/,
      use: [`babel-loader`, {
        loader: `/resolved/path/ts-loader`,
        options: expectedOptions
      }]
    });
  });
  it(`uses default configuration for the ts-loader plugin when no config is provided`, function () {
    var babelConfig = {
      plugins: [``]
    };
    var config = {
      loader: jest.fn()
    };
    modifyWebpackConfig({
      config,
      babelConfig
    }, {
      compilerOptions: {}
    });
    var expectedOptions = {
      compilerOptions: {
        target: `esnext`,
        experimentalDecorators: true,
        jsx: `react`,
        module: `es6`
      },
      transpileOnly: true
    };
    expect(getLoader()).toEqual({
      test: /\.tsx?$/,
      use: [`babel-loader`, {
        loader: `/resolved/path/ts-loader`,
        options: expectedOptions
      }]
    });
  });
  describe(`pre-processing`, function () {
    var opts = {
      compilerOptions: {}
    };
    it(`leaves non-tsx? files alone`, function () {
      expect(preprocessSource({
        contents: `alert('hello');`,
        filename: `test.js`
      }, opts)).toBeNull();
    });
    it(`transforms .ts files`, function () {
      var js = preprocessSource({
        filename: `index.ts`,
        contents: `
          declare let moment: any;

          const now: string = moment().format('HH:MM:ss');
        `
      }, opts);
      expect(js).not.toBeNull();
      expect(js).toMatchSnapshot();
    });
    it(`transforms JSX files`, function () {
      var js = preprocessSource({
        filename: `tags.ts`,
        contents: `
          import * as React from 'react';

          export default () => <h1>Hello World</h1>;
        `
      }, opts);
      expect(js).not.toBeNull();
      expect(js).toMatchSnapshot();
    });
  });
});