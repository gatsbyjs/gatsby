const mergeGatsbyConfig = require(`../merge-gatsby-config`)

describe(`Merge gatsby config`, () => {
  it(`Merging empty config is an identity operation`, () => {
    const emptyConfig = {}
    const basicConfig = {
      plugins: [`gatsby-mdx`],
    }

    expect(mergeGatsbyConfig(basicConfig, emptyConfig)).toEqual(basicConfig)
    expect(mergeGatsbyConfig(emptyConfig, basicConfig)).toEqual(basicConfig)
  })

  it(`Merging plugins concatenates them`, () => {
    const basicConfig = {
      plugins: [`gatsby-mdx`],
    }
    const morePlugins = {
      plugins: [`a-plugin`, `b-plugin`, { resolve: `c-plugin`, options: {} }],
    }
    expect(mergeGatsbyConfig(basicConfig, morePlugins)).toEqual({
      plugins: [
        `gatsby-mdx`,
        `a-plugin`,
        `b-plugin`,
        { resolve: `c-plugin`, options: {} },
      ],
    })
    expect(mergeGatsbyConfig(morePlugins, basicConfig)).toEqual({
      plugins: [
        `a-plugin`,
        `b-plugin`,
        { resolve: `c-plugin`, options: {} },
        `gatsby-mdx`,
      ],
    })
  })

  it(`Merging plugins uniqs them, keeping the first occurrence`, () => {
    const basicConfig = {
      plugins: [`gatsby-mdx`],
    }
    const morePlugins = {
      plugins: [
        `a-plugin`,
        `gatsby-mdx`,
        `b-plugin`,
        { resolve: `c-plugin`, options: {} },
      ],
    }
    expect(mergeGatsbyConfig(basicConfig, morePlugins)).toEqual({
      plugins: [
        `gatsby-mdx`,
        `a-plugin`,
        `b-plugin`,
        { resolve: `c-plugin`, options: {} },
      ],
    })
    expect(mergeGatsbyConfig(morePlugins, basicConfig)).toEqual({
      plugins: [
        `a-plugin`,
        `gatsby-mdx`,
        `b-plugin`,
        { resolve: `c-plugin`, options: {} },
      ],
    })
  })

  it(`Merging siteMetadata is recursive`, () => {
    const a = {
      siteMetadata: {
        title: `my site`,
        something: { else: 1 },
      },
    }

    const b = {
      siteMetadata: {
        something: { nested: 2 },
      },
    }

    expect(mergeGatsbyConfig(a, b)).toEqual({
      siteMetadata: {
        title: `my site`,
        something: { else: 1, nested: 2 },
      },
    })
  })

  it(`Merging proxy is overriden`, () => {
    const a = {
      proxy: {
        prefix: `/something-not/api`,
        url: `http://examplesite.com/api/`,
      },
    }

    const b = {
      proxy: {
        prefix: `/api`,
        url: `http://examplesite.com/api/`,
      },
    }

    expect(mergeGatsbyConfig(a, b)).toEqual({
      proxy: {
        prefix: `/api`,
        url: `http://examplesite.com/api/`,
      },
    })
  })
})
