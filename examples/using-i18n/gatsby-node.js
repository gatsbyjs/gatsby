const locales = require(`./i18n/config`)

// Use a little helper function to remove trailing slashes from paths
const removeTrailingSlash = path =>
  path === `/` ? path : path.replace(/\/$/, ``)

const localizedSlug = ({ isDefault, lang, slug }) =>
  isDefault ? `/${slug}` : `/${lang}/${slug}`

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions

  // First delete the incoming page that was automatically created by Gatsby
  // So everything in src/pages/
  deletePage(page)

  // Grab the keys ('en' & 'de') of locales and map over them
  Object.keys(locales).map(lang => {
    // Use the values defined in "locales" to construct the path
    const localizedPath = locales[lang].default
      ? page.path
      : `${locales[lang].path}${page.path}`

    return createPage({
      // Pass on everything from the original page
      ...page,
      // Since page.path returns with a trailing slash (e.g. "/de/")
      // We want to remove that
      path: removeTrailingSlash(localizedPath),
      // Pass in the locale as context to every page
      // This context also gets passed to the src/components/layout file
      // This should ensure that the locale is available on every page
      context: {
        locale: lang,
      },
    })
  })
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const postTemplate = require.resolve(`./src/templates/post.js`)

  const result = await graphql(`
    {
      blog: allFile(filter: { sourceInstanceName: { eq: "blog" } }) {
        edges {
          node {
            name
            relativeDirectory
            childMdx {
              frontmatter {
                title
              }
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.error(result.errors)
    return
  }

  const postList = result.data.blog.edges

  postList.forEach(({ node: post }) => {
    // Check if post.name is "index" -- because that's the file for default language
    // (In this case "en")
    const isDefault = post.name === `index`

    // Files are defined with "name-with-dashes.lang.mdx"
    // post.name returns "name-with-dashes.lang"
    // So grab the lang from that string
    // If it's the default language, pass the locale for that
    const lang = isDefault ? `en` : post.name.split(`.`)[1]

    // All files for a blogpost are stored in a folder
    // relativeDirectory is the name of the folder
    const slug = post.relativeDirectory

    createPage({
      path: localizedSlug({ isDefault, lang, slug }),
      component: postTemplate,
      context: {
        locale: lang,
      },
    })
  })
}
