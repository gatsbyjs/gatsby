const createContentDigest = require(`../create-content-digest`)

describe(`Create content digest`, () => {
  it(`returns the content digest when the input is a string`, () => {
    const input = `this is a string`

    const contentDigest = createContentDigest(input)

    expect(typeof contentDigest).toEqual(`string`)
    expect(contentDigest).toMatchInlineSnapshot(
      `"b37e16c620c055cf8207b999e3270e9b"`
    )
  })

  it(`returns the content digest when the input is a non string`, () => {
    const input = { id: 1 }

    const contentDigest = createContentDigest(input)

    expect(typeof contentDigest).toEqual(`string`)
    expect(contentDigest).toMatchInlineSnapshot(
      `"d2ce28b9a7fd7e4407e2b0fd499b7fe4"`
    )
  })
})
