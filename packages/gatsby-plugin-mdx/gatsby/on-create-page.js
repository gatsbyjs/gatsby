const path = require("path");
const fs = require("fs-extra");
const merge = require("lodash/merge");
const defaultOptions = require("../utils/default-options");
const extractExports = require("../utils/extract-exports");
const mdx = require("../utils/mdx");

module.exports = async ({ page, actions }, pluginOptions) => {
  const { createPage, deletePage } = actions;
  const { extensions, ...options } = defaultOptions(pluginOptions);
  const ext = path.extname(page.component);

  if (extensions.includes(ext)) {
    const content = await fs.readFile(page.component, "utf8");
    const code = await mdx(content, options);

    // grab the exported frontmatter
    const { frontmatter } = extractExports(code);

    deletePage(page);
    createPage(
      merge(
        {
          context: {
            frontmatter: {
              ...frontmatter
            }
          }
        },
        page
      )
    );
  }
};
