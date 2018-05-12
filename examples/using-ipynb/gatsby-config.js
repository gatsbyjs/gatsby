module.exports = {
  siteMetadata: {
    title: 'Using gatsby-transformer-ipynb',
  },
  plugins: [{
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    'gatsby-transformer-ipynb',
  ],
}