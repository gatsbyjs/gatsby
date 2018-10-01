const createContentDigest = require(`../create-content-digest`)

describe(`Create content digest`, () => {
  it(`returns the content digest`, () => {
    const content = JSON.stringify({ id: 1 })

    const contentDigest = createContentDigest(content)

    expect(contentDigest).toEqual(`d2ce28b9a7fd7e4407e2b0fd499b7fe4`)
  })

  it(`throws an error when the data argument is not a string`, () => {
    const content = [{ id: 1 }]

    expect(() => {
      createContentDigest(content)
    }).toThrow()
  })
})
