import { getParams } from "../get-params"

describe(`getParams`, () => {
  it(`gets params out of middle of url`, () => {
    const matchPath = `/products/:id/product`
    const realPath = `/products/1234/product`

    expect(getParams(matchPath, realPath).id).toEqual(`1234`)
  })

  it(`gets multiple params out of url`, () => {
    const matchPath = `/:name/:id`
    const realPath = `/burger/1234`

    const params = getParams(matchPath, realPath)

    expect(params.id).toEqual(`1234`)
    expect(params.name).toEqual(`burger`)
  })
})
