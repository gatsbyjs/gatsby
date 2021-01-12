module.exports = {
  rules: {
    // Custom ESLint rules from Gatsby
    "no-anonymous-exports-page-templates":
      process.env.GATSBY_HOT_LOADER === `fast-refresh` ? `warn` : `off`,
    "limited-exports-page-templates":
      process.env.GATSBY_HOT_LOADER === `fast-refresh` ? `warn` : `off`,
  },
}
