const babel = require("babel-core");
const babelReact = require("@babel/preset-react");
const objRestSpread = require("@babel/plugin-proposal-object-rest-spread");
const mdx = require("./mdx");
const gatherExportsGenerator = require("./babel-plugin-gather-exports");

// grab all the export values
module.exports = code => {
  const gatherExports = gatherExportsGenerator();
  const result = babel.transform(code, {
    presets: [babelReact],
    plugins: [gatherExports, objRestSpread]
  });

  const exportedVariables = gatherExports.results();

  // https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-remark/src/on-node-create.js#L22
  // Convert date objects to string. Otherwise there's type mismatches
  // during inference as some dates are strings and others date objects.
  // if (data.data) {
  //   data.data = _.mapValues(data.data, v => {
  //     if (_.isDate(v)) {
  //       return v.toJSON()
  //     } else {
  //       return v
  //     }
  //   })
  // }

  return exportedVariables;
};
