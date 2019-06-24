module.exports = {
  __experimentalThemes: [
    {
      resolve: `gatsby-theme-blog`,
      options: {},
    },
    {
      resolve: `gatsby-theme-notes`,
      options: {
        mdx: false,
        notesPath: `/notes`,
        homeText: `HOME`,
        breadcrumbSeparator: `⚡️`,
      },
    },
  ],
  siteMetadata: {
    title: `Shadowed Site Title`,
  },
}
