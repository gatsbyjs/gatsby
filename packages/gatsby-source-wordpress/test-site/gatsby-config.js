require(`dotenv`).config({
  path: `.env.WORDPRESS_BASIC_AUTH`,
})

// require .env.development or .env.production
require(`dotenv`).config({
  path: `.env.test`,
})

// require .env.plugin versions in case we need them here ever
require(`dotenv`).config({
  path: `.env.plugins`,
})

// this is it's own conditional object so we can run
// an int test with all default plugin options
const wpPluginOptions = !process.env.DEFAULT_PLUGIN_OPTIONS
  ? {
      verbose: true,
      excludeFieldNames: [`commentCount`, `commentCount`],
      schema: {
        queryDepth: 5,
        typePrefix: `Wp`,
      },
      develop: {
        nodeUpdateInterval: 3000,
      },
      debug: {
        graphql: {
          showQueryOnError: true,
          showQueryVarsOnError: false,
          copyQueryOnError: true,
          panicOnError: false,
          // a critical error is a WPGraphQL query that returns an error and response data. Currently WPGQL will error if we try to access private posts so if this is false it returns a lot of irrelevant errors.
          onlyReportCriticalErrors: true,
          writeQueriesToDisk: true,
        },
      },
      type: {
        TypeLimitTest: {
          limit: 1,
        },
        TypeLimit0Test: {
          limit: 0,
        },
        // TODO: test translation support using our own test wp graphql plugin
        // TranslationFilterTest: {
        //   where: `language: FR`,
        //   beforeChangeNode: async ({ remoteNode, type }) => {
        //     if (remoteNode.language && remoteNode.language.slug !== `fr`) {
        //       return {
        //         cancelUpdate: true,
        //       }
        //     }
        //   },
        // },
        Comment: {
          excludeFieldNames: [`databaseId`],
        },
        Page: {
          excludeFieldNames: [`enclosure`],
        },
        DatabaseIdentifier: {
          exclude: true,
        },
        User: {
          excludeFieldNames: [
            `extraCapabilities`,
            `capKey`,
            `email`,
            `registeredDate`,
          ],
        },
        Post: {
          limit:
            process.env.NODE_ENV === `development`
              ? // Lets just pull 50 posts in development to make it easy on ourselves.
                50
              : // and we don't actually need more than 1000 in production
                1000,
        },
      },
    }
  : {}

module.exports = {
  plugins: [
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets/images`,
      },
    },
    {
      resolve: require.resolve(`../package.json`),
      options: {
        url: process.env.WPGRAPHQL_URL,
        auth: {
          htaccess: {
            username: process.env.HTACCESS_USERNAME,
            password: process.env.HTACCESS_PASSWORD,
          },
        },
        ...wpPluginOptions,
      },
    },
    `gatsby-plugin-chakra-ui`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-react-svg`,
      options: {
        rule: {
          include: /\.inline\.svg$/, // See below to configure properly
        },
      },
    },
    `gatsby-plugin-netlify-cache`,
  ],
}
