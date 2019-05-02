const { gatsbyConfigSchema } = require(`../joi`)

describe(`gatsby config`, () => {
  it(`strips trailing slashes from url fields`, () => {
    const config = {
      pathPrefix: `/blog///`,
      assetPrefix: `https://cdn.example.com/`,
    }

    expect(gatsbyConfigSchema.validate(config)).resolves.toEqual({
      pathPrefix: `/blog`,
      assetPrefix: `https://cdn.example.com`,
    })
  })

  it(`allows assetPrefix to be full URL`, () => {
    const config = {
      assetPrefix: `https://cdn.example.com`,
    }

    expect(gatsbyConfigSchema.validate(config)).resolves.toEqual(config)
  })

  it(`allows assetPrefix to be a URL with nested paths`, () => {
    const config = {
      assetPrefix: `https://cdn.example.com/some/nested/path`,
    }

    expect(gatsbyConfigSchema.validate(config)).resolves.toEqual(config)
  })

  it(`allows relative paths for url fields`, () => {
    const config = {
      pathPrefix: `/blog`,
      assetPrefix: `https://cdn.example.com`,
    }

    expect(gatsbyConfigSchema.validate(config)).resolves.toEqual(config)
  })

  it(`does not allow pathPrefix to be full URL`, () => {
    const config = {
      pathPrefix: `https://google.com`,
    }

    expect(
      gatsbyConfigSchema.validate(config)
    ).rejects.toThrowErrorMatchingSnapshot()
  })

  it(`throws when relative path used for both assetPrefix and pathPrefix`, () => {
    const config = {
      assetPrefix: `/assets`,
      pathPrefix: `/blog`,
    }

    expect(
      gatsbyConfigSchema.validate(config)
    ).rejects.toThrowErrorMatchingSnapshot()
  })
})
