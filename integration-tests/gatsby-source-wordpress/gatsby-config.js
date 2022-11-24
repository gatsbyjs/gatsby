require(`dotenv`).config({
  path: `.env.test`,
})

console.log(`Sourcing data from ` + process.env.WPGRAPHQL_URL)

const mediaItemTypeSettings = {
  excludeFieldNames: [`template`],
  localFile: {
    excludeByMimeTypes: ["video/mp4"],
    /**
     * This is set to one byte smaller than the largest image in the Gatsby site so that we will have exactly one image that isn't fetched
     * during the site build
     */
    maxFileSizeBytes: 740690,
  },
}

const sharedTypeSettings = {
  Settings: {
    excludeFieldNames: [`generalSettingsEmail`],
  },
  GeneralSettings: {
    excludeFieldNames: [`email`],
  },
  WPGatsby: {
    exclude: true,
  },
  PostTypeSEO: {
    excludeFieldNames: [`twitterImage`],
  },
  BlockAttributesObject: {
    exclude: true,
  },
  BlockEditorPreview: {
    exclude: true,
  },
  Post: { excludeFieldNames: [`pinged`] },
}

const debug = {
  graphql: {
    writeQueriesToDisk: true,
    onlyReportCriticalErrors: false,
    panicOnError: true,
  },
}

// this is it's own conditional object so we can run
// an int test with all default plugin options
const wpPluginOptions = !process.env.DEFAULT_PLUGIN_OPTIONS
  ? {
      excludeFieldNames: [`commentCount`, `generalSettingsEmail`],
      debug,
      type: {
        ...sharedTypeSettings,
        MediaItem: mediaItemTypeSettings,
        TypeLimitTest: {
          limit: 1,
        },
        TypeLimit0Test: {
          limit: 0,
        },
        Comment: {
          excludeFieldNames: [`databaseId`],
        },
        Page: {
          excludeFieldNames: [`enclosure`],
          beforeChangeNode: `./src/before-change-page.js`,
        },
        DatabaseIdentifier: {
          exclude: true,
        },
        BlockEditorPreview: {
          // we need to exclude this type because nodes of this type (which are added by wp-graphql-gutenberg) seem to be somewhat unpredictably created in WP and mess up our tests that are counting total nodes of the WpContentNode type (which is an interface that includes all content nodes including WpBlockEditorPreview).
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
        Commenter: {
          excludeFieldNames: [`databaseId`],
        },
        Post: {
          limit:
            process.env.NODE_ENV === `development`
              ? // Lets just pull 50 posts in development to make it easy on ourselves.
                50
              : // and we don't actually need more than 1000 in production
                1000,
        },
        // excluding this because it causes Gatsby to throw errors
        BlockEditorContentNode: { exclude: true },
      },
    }
  : {
      excludeFieldNames: [`generalSettingsEmail`],
      type: {
        ...sharedTypeSettings,
        MediaItem: mediaItemTypeSettings,
        // excluding this because it causes Gatsby to throw errors
        BlockEditorContentNode: { exclude: true },
      },
      debug,
    }

module.exports = {
  plugins: [
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets/images`,
      },
    },
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        url: process.env.WPGRAPHQL_URL,
        schema: {
          requestConcurrency: 7,
        },
        debug,
        production: {
          hardCacheMediaFiles: true,
        },
        develop: {
          hardCacheMediaFiles: true,
        },
        auth: {
          htaccess: {
            username: process.env.HTACCESS_USERNAME,
            password: process.env.HTACCESS_PASSWORD,
          },
        },
        ...wpPluginOptions,
      },
    },
  ],
}
