module.exports = {
  siteMetadata: {
    title: 'A sample site using gatsby-source-wordpress',
    subtitle: 'Data fetched from a site hosted on wordpress.com'
  },
  plugins: [
    // https://public-api.wordpress.com/wp/v2/sites/gatsbyjsexamplewordpress.wordpress.com/pages/
    /*
     * Gatsby's data processing layer begins with “source”
     * plugins. Here the site sources its data from Wordpress.
     */
    {
      resolve: 'gatsby-source-wordpress',
      options: {
        /*
        * The base URL of the Wordpress site without the trailingslash and the protocol. This is required.
        * Example : 'gatsbyjswpexample.wordpress.com' or 'www.example-site.com'
        */
        baseUrl: 'gatsbyjswpexample.wordpress.com',
        // The protocol. This can be http or https.
        protocol: 'http',
        // Indicates whether the site is hosted on wordpress.com.
        // If false, then the asumption is made that the site is self hosted.
        // If true, then the plugin will source its content on wordpress.com using the JSON REST API V2.
        // If your site is hosted on wordpress.org, then set this to false.
        hostingWPCOM: true,
        // If useACF is true, then the source plugin will try to import the Wordpress ACF Plugin contents.
        // This feature is untested for sites hosted on Wordpress.com
        useACF: false,

        auth: {
          // If auth.user and auth.pass are filled, then the source plugin will be allowed
          // to access endpoints that are protected with .htaccess.
          htaccess_user: 'your-htaccess-username',
          htaccess_pass: 'your-htaccess-password',
          htaccess_sendImmediately: false,

          // If hostingWPCOM is true then you will need to communicate with wordpress.com API
          // in order to do that you need to create an app (of type Web) at https://developer.wordpress.com/apps/
          // then add your clientId, clientSecret, username, and password here
          wpcom_app_clientSecret: 'NMPnXYFtj2gKas7V1kZyMxr7oLry9V5ZxIyBQGu2txjVHg0GhFz6RYcKopkHICYg',
          wpcom_app_clientId: '54793',
          wpcom_user: 'gatsbyjswpexample@gmail.com',
          wpcom_pass: 'very-secured-password',

        },
        // Set verboseOutput to true to display a verbose output on `npm run develop` or `npm run build`
        // It can help you debug specific API Endpoints problems
        verboseOutput: false,
      },
    },

  ],
}
