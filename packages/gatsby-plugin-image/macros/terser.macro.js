const { createMacro } = require(`babel-plugin-macros`);
const { doSync } = require(`do-sync`);

module.exports = createMacro(terserMacro);

const syncMinify = doSync((code, options = {}) => {
  const { minify } = require(`terser`);

  return minify(code, options);
});

function terserMacro({ references, state, babel }) {
  references.default.forEach((referencePath) => {
    if (referencePath.parentPath.type === `TaggedTemplateExpression`) {
      const quasiPath = referencePath.parentPath.get(`quasi`);
      const string = quasiPath.parentPath.get(`quasi`).evaluate().value;

      const result = syncMinify(string, {
        mangle: {
          toplevel: true,
        },
      });

      quasiPath.parentPath.replaceWithSourceString(`\`${result.code}\``);
    }
  });
}
