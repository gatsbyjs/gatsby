import { derivePath } from "../derive-path"
import reporter from "gatsby-cli/lib/reporter"

describe(`derive-path`, () => {
  it(`has basic support`, () => {
    expect(
      derivePath(`product/{Product.id}.js`, { id: `1` }, reporter).derivedPath
    ).toEqual(`product/1`)
    expect(
      derivePath(`product/{product.id}.js`, { id: `1` }, reporter).derivedPath
    ).toEqual(`product/1`)
  })

  it(`converts number to string in URL`, () => {
    expect(
      derivePath(`product/{Product.id}.js`, { id: 1 }, reporter).derivedPath
    ).toEqual(`product/1`)
  })

  it(`has nested value support`, () => {
    expect(
      derivePath(
        `product/{Product.field__id}.js`,
        { field: { id: `1` } },
        reporter
      ).derivedPath
    ).toEqual(`product/1`)
  })

  it(`has support for nested collections`, () => {
    expect(
      derivePath(
        `product/{Product.id}/{Product.field__name}.js`,
        { id: 1, field: { name: `foo` } },
        reporter
      ).derivedPath
    ).toEqual(`product/1/foo`)
  })

  it(`has support for nested collections with same field`, () => {
    expect(
      derivePath(
        `product/{Product.field__name}/{Product.field__category}.js`,
        { field: { name: `foo`, category: `bar` } },
        reporter
      ).derivedPath
    ).toEqual(`product/foo/bar`)
  })

  it(`has union support`, () => {
    expect(
      derivePath(
        `product/{Product.field__(File)__id}.js`,
        {
          field: { id: `1` },
        },
        reporter
      ).derivedPath
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
      ).derivedPath
    ).toEqual(`product/bar/baz`)
  })

  it(`slugify's periods properly`, () => {
    expect(
      derivePath(
        `film/{Movie.title}.js`,
        {
          title: `Mrs. Doubtfire`,
        },
        reporter
      ).derivedPath
    ).toEqual(`film/mrs-doubtfire`)
  })

  it(`supports prefixes`, () => {
    expect(
      derivePath(
        `foo/prefix-{Model.name}.js`,
        {
          name: `dolores`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/prefix-dolores`)
  })

  it(`supports prefixes with nested collections`, () => {
    expect(
      derivePath(
        `foo/prefix{Model.name}/another-prefix_{Model.trait}.js`,
        {
          name: `dolores`,
          trait: `awesome`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/prefixdolores/another-prefix_awesome`)
  })

  it(`supports postfixes`, () => {
    expect(
      derivePath(
        `foo/{Model.name}-postfix.js`,
        {
          name: `dolores`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/dolores-postfix`)
  })

  it(`supports postfixes with nested collections`, () => {
    expect(
      derivePath(
        `foo/{Model.name}postfix/{Model.trait}_another-postfix.js`,
        {
          name: `dolores`,
          trait: `awesome`,
        },
        reporter
      ).derivedPath
    ).toEqual(`foo/dolorespostfix/awesome_another-postfix`)
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
      ).derivedPath
    ).toEqual(`blog/fire-and-powder/`)
  })
})
