const { getOptions } = require("loader-utils");
const mdx = require('./utils/mdx')

const hasDefaultExport = str => /\nexport default/.test(str);

module.exports = async function(source) {
  const callback = this.async();
  const options = getOptions(this);

  let code = await mdx(source, options);

  if (!hasDefaultExport(code) && !!options.defaultLayout) {
    code = `import DefaultLayout from "${options.defaultLayout}"


export default DefaultLayout

${code}`;
  }

  return callback(
    null,
    `import React from 'react'
import { MDXTag } from '@mdx-js/tag'


${code}
  `
  );
};
