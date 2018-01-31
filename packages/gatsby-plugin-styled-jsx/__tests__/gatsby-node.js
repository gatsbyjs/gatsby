describe(`gatsby-plugin-styled-jsx`, function () {
  var _require = require(`../gatsby-node`),
      modifyBabelrc = _require.modifyBabelrc;

  var babelrc = {
    presets: [`great`, `scott`],
    plugins: [`fitzgerald`]
  };
  it(`adds styled-jsx/babel to babelrc`, function () {
    var modified = modifyBabelrc({
      babelrc
    });
    expect(modified).toMatchObject({
      presets: [`great`, `scott`],
      plugins: [`fitzgerald`, `styled-jsx/babel`]
    });
  });
});