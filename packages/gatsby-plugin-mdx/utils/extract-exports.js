const babel = require("@babel/core");
const babelReact = require("@babel/preset-react");
const objRestSpread = require("@babel/plugin-proposal-object-rest-spread");
const gatherExportsGenerator = require("./babel-plugin-gather-exports");

// grab all the export values
module.exports = code => {
  const gatherExports = gatherExportsGenerator();
  babel.transform(code, {
    presets: [babelReact],
    plugins: [gatherExports, objRestSpread]
  });

  const exportedVariables = gatherExports.results();

  // grab the frontmatter
  const {
    _frontmatter: classicFrontmatter = {},
    frontmatter: exportFrontmatter = {},
    ...newExportedVariables
  } = exportedVariables;

  // add the merged frontmatter to the exports
  newExportedVariables.frontmatter = {
    ...classicFrontmatter,
    ...exportFrontmatter
  };

  return newExportedVariables;
};
