const path = require(`path`)

const plugin = require(`./plugin`)

const root = path.join(__dirname, `./fixtures`)
const name = `gatsby-plugin-foo`

describe(`gatsby-config`, () => {
  test(`adds a plugin to a gatsby config`, async () => {
    await plugin.create({ root }, { name })

    const result = await plugin.read({ root })

    expect(result).toContain(`gatsby-plugin-foo`)

    await plugin.destroy({ root }, { name })
  })

  test(`retrieves plugins from a config`, async () => {
    const result = await plugin.read({ root })

    expect(result).toEqual([
      `gatsby-source-filesystem`,
      `gatsby-transformer-sharp`,
      `gatsby-plugin-emotion`,
      `gatsby-plugin-typography`,
      `gatsby-transformer-remark`,
      `gatsby-plugin-sharp`,
      `gatsby-plugin-google-analytics`,
      `gatsby-plugin-manifest`,
      `gatsby-plugin-offline`,
      `gatsby-plugin-react-helmet`,
    ])
  })
})
