import { derivePath } from "../derive-path"

describe(`derive-path`, () => {
  it(`has basic support`, () => {
    expect(derivePath(`product/{Product.id}.js`, { id: `1` })).toEqual(
      `product/1`
    )
  })

  it(`has nested value support`, () => {
    expect(
      derivePath(`product/{Product.field__id}.js`, { field: { id: `1` } })
    ).toEqual(`product/1`)
  })

  it(`has union support`, () => {
    expect(
      derivePath(`product/{Product.field__(File)__id}.js`, {
        field: { id: `1` },
      })
    ).toEqual(`product/1`)
  })

  it(`doesnt remove '/' from slug`, () => {
    expect(
      derivePath(`product/{Product.slug}.js`, {
        slug: `bar/baz`,
      })
    ).toEqual(`product/bar/baz`)
  })
})
