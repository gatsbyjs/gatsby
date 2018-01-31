describe(`gatsby-plugin-react-css-modules`, function () {
  var _require = require(`../gatsby-node`),
      modifyBabelrc = _require.modifyBabelrc;

  var babelrc = {
    presets: [`great`, `scott`],
    plugins: [`fitzgerald`]
  };
  it(`adds react-css-modules to babelrc`, function () {
    var modified = modifyBabelrc({
      babelrc
    }, {});
    expect(modified).toMatchObject({
      presets: [`great`, `scott`],
      plugins: [`fitzgerald`, [`react-css-modules`, expect.any(Object)]]
    });
  });
  it(`includes custom options when modifying babelrc`, function () {
    var options = {
      exclude: `/global/`,
      filetypes: {
        ".scss": {
          syntax: `postcss-scss`
        }
      },
      generateScopedName: `[name]---[local]---[hash:base64]`
    };
    var modified = modifyBabelrc({
      babelrc
    }, options);
    expect(modified).toMatchObject({
      presets: [`great`, `scott`],
      plugins: [`fitzgerald`, [`react-css-modules`, expect.objectContaining(options)]]
    });
  });
});