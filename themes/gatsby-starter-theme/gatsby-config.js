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
        notesPath: `/txt`,
        homeText: `HOME`,
        breadcrumbSeparator: `⚡️`,
      },
    },
  ],
}
