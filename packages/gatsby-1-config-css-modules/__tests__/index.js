var _require = require(`../index`),
    cssModulesConfig = _require.cssModulesConfig,
    LOCAL_IDENT_NAME = _require.LOCAL_IDENT_NAME;

describe(`gatsby-1-config-css-modules`, function () {
  ;
  [{
    stages: [`develop`, `develop-html`],
    expectSourceMapOrNot: function expectSourceMapOrNot(expect) {
      return expect;
    }
  }, {
    stages: [`build-css`, `build-html`, `build-javascript`],
    expectSourceMapOrNot: function expectSourceMapOrNot(expect) {
      return expect.not;
    }
  }].forEach(function (_ref) {
    var stages = _ref.stages,
        expectSourceMapOrNot = _ref.expectSourceMapOrNot;
    stages.forEach(function (stage) {
      describe(`stage: ${stage}`, function () {
        var loader = cssModulesConfig(stage);
        it(`should return a CSS Modules loader`, function () {
          expect(loader).toMatch(/^css\?modules&/);
        });
        it(`should include the localIdentName`, function () {
          expect(loader).toMatch(`&localIdentName=${LOCAL_IDENT_NAME}`);
        });
        var maybeNot = Object.assign(``, {
          not: `not`
        });
        it(`should ${expectSourceMapOrNot(maybeNot)}include sourceMap`, function () {
          expectSourceMapOrNot(expect(loader)).toMatch(`&sourceMap`);
        });
      });
    });
  });
});