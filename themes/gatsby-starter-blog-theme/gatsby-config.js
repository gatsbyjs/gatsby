module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {},
    },
  ],
  // Customize your site metadata:
  siteMetadata: {
    title: `My Blog Title`,
    author: `My Name`,
    description: `My site description...`,
    social: [
      {
        name: `twitter`,
        url: `https://www.twitter.com/gatsbyjs`,
      },
      {
        name: `github`,
        url: `https://www.github.com/gatsbyjs`,
      },
    ],
  },
}
