module.exports = {
  siteMetadata: {
    title: `Using plugin options`,
    description: `An example Gatsby site using options with a local plugin`,
    author: `@gatsbyjs`,
  },
  plugins: [
    // including a plugin from the plugins folder with options
    {
      resolve: `gatsby-plugin-console-log`,
      options: { message: "Hello world" },
    },
    // including the same plugin without any options, the plugin will use a default message
    `gatsby-plugin-console-log`,
  ],
}
