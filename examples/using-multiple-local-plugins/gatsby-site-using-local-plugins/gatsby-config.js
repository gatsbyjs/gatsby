module.exports = {
  siteMetadata: {
    title: `Using Multiple Local Plugins`,
    description: `An example Gatsby site utilizing multiple local plugins`,
    author: `@gatsbyjs`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    // including a plugin from the plugins folder
    `gatsby-plugin-console-log-a`,
    {
      // including a plugin from outside the plugins folder needs the path to it
      resolve: require.resolve(`../gatsby-plugin-console-log-b`),
    },
    // including a plugin with yarn or npm link
    //   in order for this plugin to be found when you run gatsby develop
    //   you first need to run `npm link ../gatsby-plugin-console-log-c` in the `gatsby-site-using-local-plugins` root folder
    // `gatsby-plugin-console-log-c`,
  ],
}
