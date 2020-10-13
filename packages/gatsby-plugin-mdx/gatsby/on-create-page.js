const path = require(`path`)
const fs = require(`fs-extra`)
const merge = require(`lodash/merge`)
const defaultOptions = require(`../utils/default-options`)
const extractExports = require(`../utils/extract-exports`)
const mdx = require(`../utils/mdx`)

module.exports = async ({ page, actions }, pluginOptions) => {
  const { createPage, deletePage } = actions
  const { extensions, ...options } = defaultOptions(pluginOptions)
  const ext = path.extname(page.component)

  // we test to see if frontmatter is created already because that's what
  // we're trying to insert and if we don't check we can end up in infinite loops
  if (extensions.includes(ext) && !page.context.frontmatter) {
    const content = await fs.readFile(page.component, `utf8`)
    const code = await mdx(content, {
      filepath: page.component,
      ...options,
    })

    // grab the exported frontmatter
    const { frontmatter } = extractExports(code, page.component)

    deletePage(page)
    createPage(
      merge(
        {
          context: {
            frontmatter: {
              ...frontmatter,
            },
          },
        },
        page
      )
    )
  }
}
