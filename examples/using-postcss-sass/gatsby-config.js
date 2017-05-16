const lost = require(`lost`)

module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-postcss-sass`,
      options: {
        postCssPlugins: [lost()],
      },
    },
  ],
}
