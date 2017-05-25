const loadPlugins = require(`../load-plugins`)

describe(`Load plugins`, () => {
  it(`load plugins for a site`, async () => {
    let plugins = await loadPlugins({ plugins: [] })

    // Delete the resolve path as that varies depending
    // on platform so will cause snapshots to differ.
    plugins = plugins.map(plugin => {
      return {
        ...plugin,
        resolve: ``,
      }
    })

    expect(plugins).toMatchSnapshot()
  })

  it(`loads more complex plugins configuration`, async () => {
    const config = {
      plugins: [
        {
          resolve: `gatsby-source-filesystem`,
          options: {
            name: `pages`,
            path: `${__dirname}/src/pages/`,
          },
        },
        {
          resolve: `gatsby-transformer-remark`,
          options: {
            plugins: [
              {
                resolve: `gatsby-remark-responsive-image`,
                options: {
                  maxWidth: 690,
                },
              },
              {
                resolve: `gatsby-remark-responsive-iframe`,
              },
              `gatsby-remark-prismjs`,
              `gatsby-remark-copy-linked-files`,
              `gatsby-remark-smartypants`,
              `gatsby-remark-autolink-headers`,
            ],
          },
        },
        `gatsby-plugin-sharp`,
        {
          resolve: `gatsby-plugin-manifest`,
          options: {
            start_url: `/`,
            background_color: `#f7f7f7`,
            theme_color: `#191919`,
            display: `minimal-ui`,
          },
        },
        `gatsby-plugin-offline`,
      ],
    }

    let plugins = await loadPlugins(config)

    // Delete the resolve path as that varies depending
    // on platform so will cause snapshots to differ.
    plugins = plugins.map(plugin => {
      return {
        ...plugin,
        resolve: ``,
      }
    })

    expect(plugins).toMatchSnapshot()
  })
})
