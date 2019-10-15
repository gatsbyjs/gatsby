const createContentDigest = require(`../create-content-digest`)

describe(`Create content digest`, () => {
  it(`returns the content digest when the input is a string`, () => {
    const input = JSON.stringify({ id: 1 })

    const contentDigest = createContentDigest(input)

    expect(contentDigest).toMatchSnapshot()
  })

  it(`returns the content digest when the input is a non string`, () => {
    const input = { id: 1 }

    const contentDigest = createContentDigest(input)

    expect(contentDigest).toMatchSnapshot()
  })
})
