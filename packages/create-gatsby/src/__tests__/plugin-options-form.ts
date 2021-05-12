import { makePluginConfigQuestions } from "../plugin-options-form"
import pluginSchemas from "../plugin-schemas.json"

describe(`plugin-options-form`, () => {
  it(`returns an empty array when nothing is passed`, () => {
    const plugins = []
    expect(makePluginConfigQuestions(plugins)).toEqual([])
  })

  it(`returns an empty array when the plugin is not available for config`, () => {
    const plugins = [`not-valid-plugin`]
    expect(makePluginConfigQuestions(plugins)).toEqual([])
  })

  it(`returns an array containing only the WordPress options (choices are included)`, () => {
    const plugins = [`gatsby-source-wordpress`]
    expect(makePluginConfigQuestions(plugins)).toEqual([
      {
        type: `forminput`,
        name: `gatsby-source-wordpress`,
        multiple: true,
        message: `Configure the WordPress plugin.\nSee \u001b[94mhttps://www.gatsbyjs.com/plugins/gatsby-source-wordpress/\u001b[39m for help.`,
        choices: [
          {
            name: `url`,
            message: `url`,
            hint: `This should be the full url of your GraphQL endpoint set up by WP GraphQL`,
          },
        ],
      },
    ])
  })

  it(`returns an array with all the plugins schemas`, () => {
    expect(makePluginConfigQuestions(Object.keys(pluginSchemas))).toEqual([
      {
        type: `forminput`,
        name: `gatsby-source-wordpress`,
        multiple: true,
        message: `Configure the WordPress plugin.\nSee \u001b[94mhttps://www.gatsbyjs.com/plugins/gatsby-source-wordpress/\u001b[39m for help.`,
        choices: [
          {
            name: `url`,
            message: `url`,
            hint: `This should be the full url of your GraphQL endpoint set up by WP GraphQL`,
          },
        ],
      },
      {
        type: `forminput`,
        name: `gatsby-source-contentful`,
        multiple: true,
        message: `Configure the Contentful plugin.\nSee \u001b[94mhttps://www.gatsbyjs.com/plugins/gatsby-source-contentful/\u001b[39m for help.\n\u001b[32mUse arrow keys to move between fields, and enter to finish\u001b[39m`,
        choices: [
          {
            name: `accessToken`,
            message: `accessToken`,
            hint: `Contentful delivery api key, when using the Preview API use your Preview API key`,
          },
          { name: `spaceId`, message: `spaceId`, hint: `Contentful spaceId` },
        ],
      },
      {
        type: `forminput`,
        name: `gatsby-source-sanity`,
        multiple: true,
        message: `Configure the Sanity plugin.\nSee \u001b[94mhttps://www.gatsbyjs.com/plugins/gatsby-source-sanity/\u001b[39m for help.\n\u001b[32mUse arrow keys to move between fields, and enter to finish\u001b[39m`,
        choices: [
          {
            name: `projectId`,
            message: `projectId`,
            hint: `Your Sanity project's ID`,
          },
          {
            name: `dataset`,
            message: `dataset`,
            hint: `The dataset to fetch from`,
          },
        ],
      },
      {
        type: `forminput`,
        name: `gatsby-source-shopify`,
        multiple: true,
        message: `Configure the Shopify plugin.\nSee \u001b[94mhttps://www.gatsbyjs.com/plugins/gatsby-source-shopify/\u001b[39m for help.\n\u001b[32mUse arrow keys to move between fields, and enter to finish\u001b[39m`,
        choices: [
          {
            name: `shopName`,
            message: `shopName`,
            hint: `The domain name of your Shopify shop`,
          },
          {
            name: `accessToken`,
            message: `accessToken`,
            hint: `An API access token to your Shopify shop`,
          },
        ],
      },
      {
        type: `forminput`,
        name: `gatsby-source-datocms`,
        multiple: true,
        message: `Configure the DatoCMS plugin.\nSee \u001b[94mhttps://www.gatsbyjs.com/plugins/gatsby-source-datocms/\u001b[39m for help.`,
        choices: [
          {
            name: `apiToken`,
            message: `apiToken`,
            hint: `Your read-only API token under the Settings > API tokens section of your administrative area in DatoCMS`,
          },
        ],
      },
      {
        type: `forminput`,
        name: `gatsby-source-agility`,
        multiple: true,
        message: `Configure the gatsby-source-agility plugin.\nSee \u001b[94mhttps://www.gatsbyjs.com/plugins/gatsby-source-agility/\u001b[39m for help.`,
        choices: [
          {
            name: `guid`,
            message: `guid`,
            hint: `your Agility Content Fetch API Guid`,
          },
        ],
      },
      {
        type: `forminput`,
        name: `gatsby-plugin-google-analytics`,
        multiple: true,
        message: `Configure the gatsby-plugin-google-analytics plugin.\nSee \u001b[94mhttps://www.gatsbyjs.com/plugins/gatsby-plugin-google-analytics/\u001b[39m for help.`,
        choices: [
          {
            name: `trackingId`,
            message: `trackingId`,
            hint: `The property ID; the tracking code won't be generated without it`,
          },
        ],
      },
    ])
  })
})
