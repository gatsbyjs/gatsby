const fs = require("fs");
const path = require("path");
const slash = require("slash");

module.exports = () => {
  const files = fs.readdirSync("./.cache/gatsby-mdx/mdx-scopes-dir");
  const abs = path.resolve("./.cache/gatsby-mdx/mdx-scopes-dir");
  return (
    files
      .map(
        (file, i) =>
          `const scope_${i} = require('${slash(path.join(abs, file))}').default;`
      )
      .join("\n") +
    `export default {
  ${files.map((_, i) => "...scope_" + i).join(",\n")}
}`
  );
};
