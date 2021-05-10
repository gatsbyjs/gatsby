import { getCollectionRouteParams } from "../get-collection-route-params"

describe(`getCollectionRouteParams`, () => {
  it(`gets params out of middle of url`, () => {
    const filePath = `/products/{Product.id}/product.js`
    const urlPath = `/products/1234/product`

    expect(getCollectionRouteParams(filePath, urlPath).id).toEqual(`1234`)
  })

  it(`gets multiple params out of url`, () => {
    const filePath = `/{Product.name}/{Product.id}.js`
    const urlPath = `/burger/1234`

    const params = getCollectionRouteParams(filePath, urlPath)

    expect(params.id).toEqual(`1234`)
    expect(params.name).toEqual(`burger`)
  })

  it(`gets multiple params out of url in same part`, () => {
    const filePath = `/{Product.name}-{Product.id}_{Product.desc}.{Product.number}.js`
    const urlPath = `/burger-1234_foo.bar`

    const params = getCollectionRouteParams(filePath, urlPath)

    expect(params.id).toEqual(`1234`)
    expect(params.name).toEqual(`burger`)
    expect(params.desc).toEqual(`foo`)
    expect(params.number).toEqual(`bar`)
  })

  it(`gets multiple params out of url with prefixes`, () => {
    const filePath = `/products/prefix-{Product.id}/another-prefix_{Product.name}/product.js`
    const urlPath = `/products/prefix-1234/another-prefix_burger/product`

    const params = getCollectionRouteParams(filePath, urlPath)

    expect(params.id).toEqual(`1234`)
    expect(params.name).toEqual(`burger`)
  })

  it(`gets multiple params out of url with postfixes`, () => {
    const filePath = `/products/{Product.id}-postfix/{Product.name}_another-postfix/product.js`
    const urlPath = `/products/1234-postfix/burger_another-postfix/product`

    const params = getCollectionRouteParams(filePath, urlPath)

    expect(params.id).toEqual(`1234`)
    expect(params.name).toEqual(`burger`)
  })

  it(`outputs empty object for no matches`, () => {
    const filePath = `/products/{Product.id}-test.js`
    const urlPath = `/products/1234`

    const params = getCollectionRouteParams(filePath, urlPath)

    expect(params).toEqual({})
  })
})
