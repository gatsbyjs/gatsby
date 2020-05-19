exports.onCreatePage = ({ page, actions }, pluginOptions) => {
  const { createPage } = actions
  const { languages } = pluginOptions

  // NOTE: Right now, the default language (English) isn't counted among the list of languages.
  // If we were to add it, we'd need to run `deletePage` on the original page and create a new one.
  for (const lang of languages) {
    createPage({
      ...page,
      path: `/${lang}${page.path}`,
      context: {
        ...page.context,
        locale: lang,
      },
    })
  }
}
