exports.onCreatePage = ({ page, actions }, pluginOptions) => {
  const { createPage } = actions
  const { languages } = pluginOptions

  for (lang of languages) {
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
