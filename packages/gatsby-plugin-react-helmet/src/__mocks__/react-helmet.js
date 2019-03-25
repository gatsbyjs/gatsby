const helmet = {
  htmlAttributes: { toComponent: () => `html-attributes-component` },
  bodyAttributes: { toComponent: () => `body-attributes-component` },
  title: { toComponent: () => `title-component` },
  link: { toComponent: () => `link-component` },
  meta: { toComponent: () => `meta-component` },
  noscript: { toComponent: () => `noscript-component` },
  script: { toComponent: () => `script-component` },
  style: { toComponent: () => `style-component` },
}

module.exports = {
  Helmet: {
    renderStatic: () => helmet,
  },
}
