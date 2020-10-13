import { derivePath } from "../derive-path"
import reporter from "gatsby-cli/lib/reporter"
import { createPath } from "gatsby-page-utils"

describe(`derive-path`, () => {
  it(`has basic support`, () => {
    expect(
      derivePath(`product/{Product.id}.js`, { id: `1` }, reporter)
    ).toEqual(`product/1`)
  })

  it(`converts number to string in URL`, () => {
    expect(derivePath(`product/{Product.id}.js`, { id: 1 }, reporter)).toEqual(
      `product/1`
    )
  })

  it(`has nested value support`, () => {
    expect(
      derivePath(
        `product/{Product.field__id}.js`,
        { field: { id: `1` } },
        reporter
      )
    ).toEqual(`product/1`)
  })

  it(`has union support`, () => {
    expect(
      derivePath(
        `product/{Product.field__(File)__id}.js`,
        {
          field: { id: `1` },
        },
        reporter
      )
    ).toEqual(`product/1`)
  })

  it(`doesnt remove '/' from slug`, () => {
    expect(
      derivePath(
        `product/{Product.slug}.js`,
        {
          slug: `bar/baz`,
        },
        reporter
      )
    ).toEqual(`product/bar/baz`)
  })

  it(`slugify's periods properly`, () => {
    expect(
      createPath(
        derivePath(
          `film/{Movie.title}.js`,
          {
            title: `Mrs. Doubtfire`,
          },
          reporter
        )
      )
    ).toEqual(`/film/mrs-doubtfire/`)
  })

  it(`keeps existing slashes around and handles possible double forward slashes`, () => {
    // This tests two things
    // 1) The trailing slash should be transferred (normally "@sindresorhus/slugify" would remove that)
    // 2) There shouldn't be a double forward slash in the final URL => blog//fire-and-powder/
    expect(
      derivePath(
        `blog/{MarkdownRemark.fields__slug}.js`,
        {
          fields: {
            slug: `/fire-and-powder/`,
          },
        },
        reporter
      )
    ).toEqual(`blog/fire-and-powder/`)
  })
})
