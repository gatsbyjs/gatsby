import { gatsbyConfigSchema, nodeSchema } from "../joi"

describe(`gatsby config`, () => {
  it(`returns empty pathPrefix when not set`, () => {
    const config = {}

    const result = gatsbyConfigSchema.validate(config)
    expect(result.value).toEqual(
      expect.objectContaining({
        pathPrefix: ``,
      })
    )
  })

  it(`throws when linkPrefix is set`, () => {
    const config = {
      linkPrefix: `/blog/`,
    }

    const result = gatsbyConfigSchema.validate(config)
    expect(result.error).toMatchInlineSnapshot(
      `[Error: "linkPrefix" should be changed to "pathPrefix"]`
    )
  })

  it(`strips trailing slashes from url fields`, () => {
    const config = {
      pathPrefix: `/blog///`,
      assetPrefix: `https://cdn.example.com/`,
    }

    const result = gatsbyConfigSchema.validate(config)
    expect(result.value).toEqual(
      expect.objectContaining({
        pathPrefix: `/blog`,
        assetPrefix: `https://cdn.example.com`,
      })
    )
  })

  it(`allows assetPrefix to be full URL`, () => {
    const config = {
      assetPrefix: `https://cdn.example.com/`,
    }

    const result = gatsbyConfigSchema.validate(config)
    expect(result.value).toEqual(
      expect.objectContaining({
        assetPrefix: `https://cdn.example.com`,
      })
    )
  })

  it(`allows assetPrefix to be a URL with nested paths`, () => {
    const config = {
      assetPrefix: `https://cdn.example.com/some/nested/path`,
    }

    const result = gatsbyConfigSchema.validate(config)
    expect(result.value).toEqual(expect.objectContaining(config))
  })

  it(`allows relative paths for url fields`, () => {
    const config = {
      pathPrefix: `/blog`,
      assetPrefix: `https://cdn.example.com`,
    }

    const result = gatsbyConfigSchema.validate(config)
    expect(result.value).toEqual(expect.objectContaining(config))
  })

  it(`strips trailing slash and add leading slash to pathPrefix`, () => {
    const config = {
      pathPrefix: `blog/`,
      assetPrefix: `https://cdn.example.com/`,
    }

    const result = gatsbyConfigSchema.validate(config)
    expect(result.value).toEqual(
      expect.objectContaining({
        pathPrefix: `/blog`,
        assetPrefix: `https://cdn.example.com`,
      })
    )
  })

  it(`does not allow pathPrefix to be full URL`, () => {
    const config = {
      pathPrefix: `https://google.com`,
    }

    const result = gatsbyConfigSchema.validate(config)
    expect(result.error).toMatchInlineSnapshot(
      `[ValidationError: "pathPrefix" must be a valid relative uri]`
    )
  })

  it(`throws when relative path used for both assetPrefix and pathPrefix`, () => {
    const config = {
      assetPrefix: `/assets`,
      pathPrefix: `/blog`,
    }

    const result = gatsbyConfigSchema.validate(config)
    expect(result.error).toMatchInlineSnapshot(
      `[Error: assetPrefix must be an absolute URI when used with pathPrefix]`
    )
  })
})

describe(`node schema`, () => {
  it(`allows correct nodes`, () => {
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

  it(`force id type`, () => {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(error!.message).toMatchInlineSnapshot(`"\\"id\\" must be a string"`)
  })

  it(`doesn't allow unknown internal fields`, () => {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(error!.message).toMatchInlineSnapshot(
      `"\\"internal.customField\\" is not allowed"`
    )
  })
})
