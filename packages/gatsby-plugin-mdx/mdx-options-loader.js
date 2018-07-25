const { getOptions } = require("loader-utils");
const mdx = require("@mdx-js/mdx");
//const transform = require("babel-core").transform;

//const DefaultImportChecker = require("./src/babel-plugin-detect-default-export");

const hasDefaultExport = str => /\nexport default/.test(str);

module.exports = async function(content) {
  const callback = this.async();
  const options = getOptions(this);

  let newContent = content;

  if (!hasDefaultExport(content) && !!options.defaultLayout) {
    //    console.log("inject default export");
    newContent = `import DefaultLayout from "${options.defaultLayout}"


export default DefaultLayout

    ${content}`;
  } else {
    //    console.log("dont inject");
  }

  const result = await mdx(newContent, options || {});

  const code = `
  import React from 'react'
  import { MDXTag } from '@mdx-js/tag'


  ${result}
  `;

  return callback(null, code);
};
