const { getOptions } = require("loader-utils");
const mdx = require("@mdx-js/mdx");
const grayMatter = require("gray-matter");

const hasDefaultExport = str => /\nexport default/.test(str);

module.exports = async function(content) {
  const callback = this.async();
  const options = getOptions(this);

  const matter = grayMatter(content);

  let newContent = `export const _frontmatter = ${JSON.stringify(matter.data)};

${matter.content}
  `;

  if (!hasDefaultExport(newContent) && !!options.defaultLayout) {
    //    console.log("inject default export");
    newContent = `import DefaultLayout from "${options.defaultLayout}"


export default DefaultLayout

${newContent}`;
  } else {
    //    console.log("dont inject");
  }

  const result = await mdx(newContent, options || {});

  return callback(
    null,
    `import React from 'react'
import { MDXTag } from '@mdx-js/tag'


${result}
  `
  );
};
