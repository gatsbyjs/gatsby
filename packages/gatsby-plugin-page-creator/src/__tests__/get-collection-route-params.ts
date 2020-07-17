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
})
