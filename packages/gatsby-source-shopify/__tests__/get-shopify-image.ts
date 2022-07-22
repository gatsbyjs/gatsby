import { getShopifyImage } from "../src/get-shopify-image"

const image = {
  originalSrc: `https://cdn.shopify.com/s/files/1/0854/5382/products/front-hero.jpg?v=1460125603`,
  width: 2048,
  height: 1535,
}

describe(`getShopifyImage`, () => {
  it(`generates an imagedata object`, () => {
    const data = getShopifyImage({ image, layout: `fullWidth` })
    expect(data).toMatchSnapshot()
  })
})
