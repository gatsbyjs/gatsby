import { getCollectionRouteParams } from "../get-collection-route-params"
import path from "path"

// windows and mac have different seperators, all code is written with unix-like
// file systems, but the underlying code uses `path.sep`. So when running tests
// on windows, they would fail without us swapping the seperators.
const compatiblePath = (filepath: string): string =>
  filepath.replace(/\//g, path.sep)

describe(`getCollectionRouteParams`, () => {
  it(`gets params out of middle of url`, () => {
    const filePath = compatiblePath(`/products/{id}/product`)
    const urlPath = compatiblePath(`/products/1234/product`)

    expect(getCollectionRouteParams(filePath, urlPath).id).toEqual(`1234`)
  })

  it(`gets multiple params out of url`, () => {
    const filePath = compatiblePath(`/{name}/{id}`)
    const urlPath = compatiblePath(`/burger/1234`)

    const params = getCollectionRouteParams(filePath, urlPath)

    expect(params.id).toEqual(`1234`)
    expect(params.name).toEqual(`burger`)
  })
})
