const { getOptions } = require("loader-utils");
const mdx = require("./utils/mdx");
const debug = require("debug")("gatsby-mdx:mdx-loader");

const hasDefaultExport = str => /\nexport default/.test(str);

module.exports = async function(content) {
  const callback = this.async();
  const options = getOptions(this);

  let code = content;
  // after running mdx, the code *always* has a default export, so this
  // check needs to happen first.
  if (!hasDefaultExport(content) && !!options.defaultLayout) {
    debug("inserting default layout", options.defaultLayout);
    code = `import DefaultLayout from "${options.defaultLayout}"


export default DefaultLayout

${content}`;
  }

  code = await mdx(code, options);

  return callback(
    null,
    `import React from 'react'
import { MDXTag } from '@mdx-js/tag'


${code}
  `
  );
};
