const { createMacro } = require(`babel-plugin-macros`);
const { doSync } = require(`do-sync`);

module.exports = createMacro(cssNanoMacro);

const syncMinify = doSync((code, options = {}) => {
  const postcss = require(`postcss`);

  return postcss({
    plugins: [
      require(`cssnano`)({
        preset: [`default`, { discardComments: { removeAll: true } }],
      }),
    ],
  }).process(code, { from: undefined, to: undefined });
});

function cssNanoMacro({ references, state, babel }) {
  references.default.forEach((referencePath) => {
    if (referencePath.parentPath.type === `TaggedTemplateExpression`) {
      const quasiPath = referencePath.parentPath.get(`quasi`);
      const string = quasiPath.parentPath.get(`quasi`).evaluate().value;

      const result = syncMinify(string);

      quasiPath.parentPath.replaceWithSourceString(`\`${result.css}\``);
    }
  });
}
