module.exports = {
  siteMetadata: {
    title: "Gatsby Starter - Photon",
    author: "Hunter Chang",
    description: "A Gatsby.js Starter based on Photon by HTML5 UP"
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-kentico-cloud',
      options: {
        deliveryClientConfig: {
          projectId: 'be4a893e-e87c-00e3-c66a-203a876e058a',
          typeResolvers: []
        },
        languageCodenames: [
          `default`
        ]
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'kentico-cloud-gatsby-template',
        short_name: 'kc-gatsby',
        start_url: '/',
        background_color: '#0087DC',
        theme_color: '#0087DC',
        display: 'minimal-ui',
        icon: 'src/assets/images/kentico-cloud.png', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-sass',
    'gatsby-plugin-offline'
  ],
}
