const generate = require("babel-generator").default;
const JSON5 = require("json5");

module.exports = () => {
  let results = {};

  const plugin = () => {
    const visitor = {
      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration;
        if (
          declaration.type === "VariableDeclaration" &&
          declaration.kind === "const"
        ) {
          declaration.declarations.forEach(declarator => {
            try {
              results[declarator.id.name] = JSON5.parse(
                generate(declarator.init).code
              );
            } catch (e) {
              // why was this empty?
            }
          });
        }
      }
    };

    return { visitor };
  };

  plugin.results = () => results;

  return plugin;
};
