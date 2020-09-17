import { derivePath } from "../derive-path"
import reporter from "gatsby-cli/lib/reporter"
import { createPath } from "gatsby-page-utils"

describe(`derive-path`, () => {
  it(`has basic support`, () => {
    expect(
      derivePath(`product/{Product.id}.js`, { id: `1` }, reporter)
    ).toEqual(`product/1`)
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
})
