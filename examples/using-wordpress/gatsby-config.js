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
        * Example : 'gatsbyjsexamplewordpress.wordpress.com' or 'www.example-site.com' 
        */
        baseUrl: 'gatsbyjsexamplewordpress.wordpress.com',
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
        // If auth.user and auth.pass are filled, then the source plugin will be allowed to access endpoints that are protected with .htaccess. 
        auth: {
          user: 'your-htaccess-username',
          pass: 'your-htaccess-password',
          sendImmediately: false
        },
        // Set verboseOutput to true to display a verbose output on `npm run develop` or `npm run build` 
        // It can help you debug specific API Endpoints problems 
        verboseOutput: false,
      },
    },

    // Will crates nodes of type "type": "File", and "owner": "gatsby-source-filesystem"
    // {
    //   resolve: 'gatsby-source-filesystem',
    //   options: {
    //     name: 'cache',
    //     path: `${__dirname}/.cache/source-wordpress`,
    //   },
    // },

    // v TODOS below  v

    // This plugin exposes helper functions for processing
    // images with the NPM package “sharp”. It's used by
    // several other plugins.
    // 'gatsby-plugin-sharp',

    // This plugin identifies file nodes that are images and
    // transforms these to create new “ImageSharp” nodes.
    // With them you can resize images and
    // generate responsive image thumbnails.
    // 'gatsby-transformer-sharp',

    // This plugin takes your configuration and generates a
    // web manifest file so Gatsbygram can be added to your
    // homescreen on Android.
    // If this is before the Offline, then the Manifest will 
    // also be put in the Offline app.
    // {
    //   resolve: 'gatsby-plugin-manifest',
    //   options: {
    //     name: 'BCG-DV',
    //     short_name: 'BCGDV',
    //     start_url: '/',
    //     background_color: '#f7f7f7',
    //     theme_color: '#191919',
    //     display: 'minimal-ui',
    //   },
    // },

    // This plugin generates a service worker and AppShell
    // html file so the site works offline and is otherwise
    // resistant to bad networks. Works with almost any
    // site!
    // 'gatsby-plugin-offline',

    // This plugin sets up Google Analytics for you.
    // {
    //   resolve: 'gatsby-plugin-google-analytics',
    //   options: {
    //     trackingId: 'UA-93349937-2',
    //   },
    // },
  ],
}
