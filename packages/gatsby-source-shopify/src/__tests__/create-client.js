const { createClient } = require(`../create-client`)

describe(`create-client`, () => {
  it(`Allows a domain as shop name`, () => {
    expect(createClient(`my-shop.com`, `token`).url).toEqual(
      expect.not.stringContaining(`myshopify.com`)
    )
  })

  it(`Allows a non-domain shop name`, () => {
    expect(createClient(`my-shop`, `token`).url).toEqual(
      expect.stringContaining(`myshopify.com`)
    )
  })
})
