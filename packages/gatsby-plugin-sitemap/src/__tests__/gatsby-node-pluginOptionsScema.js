/* eslint-disable filenames/match-regex */
process.env.GATSBY_EXPERIMENTAL_PLUGIN_OPTION_VALIDATION = true

jest.mock(`sitemap`, () => {
  return {
    simpleSitemapAndIndex: jest.fn(),
  }
})

const sitemap = require(`sitemap`)

const { validateOptionsSchema, Joi } = require(`gatsby-plugin-utils`)
const { onPostBuild, pluginOptionsSchema } = require(`../gatsby-node`)

const pathPrefix = ``

const reporter = {
  verbose: jest.fn(),
  panic: jest.fn(),
}

const graphql = jest.fn()
graphql.mockResolvedValue({
  data: {
    site: {
      siteMetadata: {
        siteUrl: `http://dummy.url`,
      },
    },
    allSitePage: {
      nodes: [
        {
          path: `/page-1`,
        },
        {
          path: `/page-2`,
        },
      ],
    },
  },
})

beforeEach(() => {
  global.__PATH_PREFIX__ = ``

  sitemap.simpleSitemapAndIndex.mockReset()
})

describe(`gatsby-plugin-sitemap Node API with Expermintal plugin option Validation`, () => {
  it(`should succeed when using \`pluginOptionsSchema\` API`, async () => {
    const optionSchema = pluginOptionsSchema({ Joi })

    const pluginOptions = await validateOptionsSchema(optionSchema, {})

    expect(pluginOptions).toMatchSnapshot()

    await onPostBuild({ graphql, pathPrefix, reporter }, pluginOptions)
  })
})
