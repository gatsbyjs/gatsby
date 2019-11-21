const { gatsbyConfigSchema, nodeSchema } = require(`../joi`)

describe(`gatsby config`, () => {
  it(`returns empty pathPrefix when not set`, async () => {
    const config = {}

    const result = await gatsbyConfigSchema.validate(config)
    expect(result).toEqual(
      expect.objectContaining({
        pathPrefix: ``,
      })
    )
  })

  it(`strips trailing slashes from url fields`, async () => {
    const config = {
      pathPrefix: `/blog///`,
      assetPrefix: `https://cdn.example.com/`,
    }

    const result = await gatsbyConfigSchema.validate(config)
    expect(result).toEqual(
      expect.objectContaining({
        pathPrefix: `/blog`,
        assetPrefix: `https://cdn.example.com`,
      })
    )
  })

  it(`allows assetPrefix to be full URL`, async () => {
    const config = {
      assetPrefix: `https://cdn.example.com/`,
    }

    const result = await gatsbyConfigSchema.validate(config)
    expect(result).toEqual(
      expect.objectContaining({
        assetPrefix: `https://cdn.example.com`,
      })
    )
  })

  it(`allows assetPrefix to be a URL with nested paths`, async () => {
    const config = {
      assetPrefix: `https://cdn.example.com/some/nested/path`,
    }

    const result = await gatsbyConfigSchema.validate(config)
    expect(result).toEqual(expect.objectContaining(config))
  })

  it(`allows relative paths for url fields`, async () => {
    const config = {
      pathPrefix: `/blog`,
      assetPrefix: `https://cdn.example.com`,
    }

    const result = await gatsbyConfigSchema.validate(config)
    expect(result).toEqual(expect.objectContaining(config))
  })

  it(`strips trailing slash and add leading slash to pathPrefix`, async () => {
    const config = {
      pathPrefix: `blog/`,
      assetPrefix: `https://cdn.example.com/`,
    }

    const result = await gatsbyConfigSchema.validate(config)
    expect(result).toEqual(
      expect.objectContaining({
        pathPrefix: `/blog`,
        assetPrefix: `https://cdn.example.com`,
      })
    )
  })

  it(`does not allow pathPrefix to be full URL`, async () => {
    expect.assertions(1)
    const config = {
      pathPrefix: `https://google.com`,
    }

    try {
      await gatsbyConfigSchema.validate(config)
    } catch (err) {
      expect(err.message).toMatchSnapshot()
    }
  })

  it(`throws when relative path used for both assetPrefix and pathPrefix`, async () => {
    expect.assertions(1)
    const config = {
      assetPrefix: `/assets`,
      pathPrefix: `/blog`,
    }

    try {
      await gatsbyConfigSchema.validate(config)
    } catch (err) {
      expect(err.message).toMatchSnapshot()
    }
  })
})

describe(`node schema`, () => {
  it(`allows correct nodes`, async () => {
    const node = {
      id: `foo`,
      internal: {
        type: `Type`,
        contentDigest: `bar`,

        // this is added by gatsby
        owner: `gatsby-source-foo`,
      },
    }

    const { error } = nodeSchema.validate(node)
    expect(error).toBeFalsy()
  })

  it(`force id type`, async () => {
    const node = {
      id: 5,
      internal: {
        type: `Type`,
        contentDigest: `bar`,

        // this is added by gatsby
        owner: `gatsby-source-foo`,
      },
    }

    const { error } = nodeSchema.validate(node)
    expect(error).toBeTruthy()
    expect(error.message).toMatchSnapshot()
  })

  it(`doesn't allow unknown internal fields`, async () => {
    const node = {
      id: `foo`,
      internal: {
        type: `Type`,
        contentDigest: `bar`,

        customField: `this should cause failure`,

        // this is added by gatsby
        owner: `gatsby-source-foo`,
      },
    }

    const { error } = nodeSchema.validate(node)
    expect(error).toBeTruthy()
    expect(error.message).toMatchSnapshot()
  })
})
