import { getMatchPath } from "../get-match-path"

describe(`getMatchPath`, () => {
  it(`returns an empty object when there is no match path interpolation`, () => {
    expect(getMatchPath(`{Product.foo}/bar`)).toBeUndefined()
  })

  it(`returns a match for segments`, () => {
    expect(getMatchPath(`baz/123/[bar]`)).toEqual(`baz/123/:bar`)
  })

  it(`returns a match for named splats`, () => {
    expect(getMatchPath(`baz/123/[...bar]`)).toEqual(`baz/123/*bar`)
  })

  it(`returns a match for splats`, () => {
    expect(getMatchPath(`baz/123/[...]`)).toEqual(`baz/123/*`)
  })

  it(`handles multiple matches`, () => {
    expect(getMatchPath(`/products/[id]/[...page]`)).toEqual(
      `/products/:id/*page`
    )
    expect(getMatchPath(`/products/[brand]/offer/[coupon]`)).toEqual(
      `/products/:brand/offer/:coupon`
    )
  })

  it(`handles collection paths in-between`, () => {
    expect(getMatchPath(`/products/{Model.foo}/[...page]`)).toEqual(
      `/products/{Model.foo}/*page`
    )
  })
})
