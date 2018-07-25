const { getOptions } = require("loader-utils");
const frontmatter = require("gray-matter");

module.exports = async function(content) {
  const callback = this.async();
  const options = getOptions(this);

  const matter = frontmatter(content);

  const code = `
export const _frontmatter = ${JSON.stringify(matter.data)};

${matter.content}
`;

  return callback(null, code);
};
