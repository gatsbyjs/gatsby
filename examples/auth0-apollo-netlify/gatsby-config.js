module.exports = {
  siteMetadata: {
    title: 'Gatsby Auth0 Apollo Netlify',
    description: `The best site description ever...`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-playground`,
    {
      resolve: 'gatsby-plugin-typography',
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    {
      resolve: `gatsby-plugin-env-variables`,
      options: {
        whitelist: ['AUTH0_DOMAIN', 'AUTH0_CLIENT_ID'],
      },
    },
  ],
};
