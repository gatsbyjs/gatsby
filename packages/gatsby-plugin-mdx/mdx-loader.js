const _ = require("lodash");
const { getOptions } = require("loader-utils");
const mdx = require("./utils/mdx");
const debug = require("debug")("gatsby-mdx:mdx-loader");

const hasDefaultExport = str => /\nexport default/.test(str);

module.exports = async function(content) {
  const callback = this.async();
  const { getNodes, pluginOptions } = getOptions(this);

  const fileNode = _.first(
    getNodes().filter(
      node =>
        node.internal.type === `File` && node.absolutePath === this.resourcePath
    )
  );

  const source = fileNode && fileNode.sourceInstanceName;

  // get the default layout for the file source group, or if it doesn't
  // exist, the overall default layout
  const defaultLayout = _.get(
    pluginOptions.defaultLayouts, source,
    _.get(pluginOptions.defaultLayouts, "default")
  );

  let code = content;
  // after running mdx, the code *always* has a default export, so this
  // check needs to happen first.
  if (!hasDefaultExport(content) && !!defaultLayout) {
    debug("inserting default layout", defaultLayout);
    code = `import DefaultLayout from "${defaultLayout}"


export default DefaultLayout

${content}`;
  }

  code = await mdx(code, pluginOptions);

  return callback(
    null,
    `import React from 'react'
import { MDXTag } from '@mdx-js/tag'


${code}
  `
  );
};
