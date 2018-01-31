jest.mock(`../resolve`, function () {
  return function (module) {
    return `/resolved/path/${module}`;
  };
});

var _require = require(`../gatsby-node`),
    resolvableExtensions = _require.resolvableExtensions,
    modifyWebpackConfig = _require.modifyWebpackConfig,
    preprocessSource = _require.preprocessSource;

describe(`gatsby-plugin-coffeescript`, function () {
  it(`contains coffee script extensions`, function () {
    expect(resolvableExtensions()).toMatchSnapshot();
  });
  it(`modifies webpack config with cofeescript extensions`, function () {
    var actions = {
      setWebpackConfig: jest.fn()
    };
    var loaders = {
      js: function js() {
        return `babel-loader`;
      }
    };
    modifyWebpackConfig({
      actions,
      loaders
    });
    expect(actions.setWebpackConfig).toHaveBeenCalledTimes(resolvableExtensions().length);
    var lastCall = actions.setWebpackConfig.mock.calls.pop();
    expect(lastCall).toMatchSnapshot();
  });
  describe(`pre processing`, function () {
    it(`returns null if non-coffeescript file`, function () {
      expect(preprocessSource({
        filename: `test.js`,
        contents: `alert('hello');`
      })).toBe(null);
    });
    it(`transforms .coffee files`, function () {
      expect(preprocessSource({
        filename: `test.coffee`,
        contents: `alert "I knew it!" if elvis?`
      }, {})).toMatchSnapshot();
    });
  });
});