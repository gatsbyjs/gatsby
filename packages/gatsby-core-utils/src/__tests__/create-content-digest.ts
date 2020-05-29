import { createContentDigest } from "../create-content-digest"

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
      `"db1aa405ee004296a31f04620bbb8e28"`
    )
  })

  // @fixes https://github.com/gatsbyjs/gatsby/issues/21840
  it(`returns the content digest when input is a Buffer`, () => {
    const input = Buffer.from(`1234`)
    const input2 = Buffer.from(`5678`)

    const contentDigest = createContentDigest(input)
    const contentDigest2 = createContentDigest(input2)

    expect(typeof contentDigest).toEqual(`string`)
    expect(contentDigest).toMatchInlineSnapshot(
      `"81dc9bdb52d04dc20036dbd8313ed055"`
    )
    expect(contentDigest2).toMatchInlineSnapshot(
      `"674f3c2c1a8a6f90461e8a66fb5550ba"`
    )
    expect(contentDigest).not.toEqual(contentDigest2)
  })

  // @fixes https://github.com/gatsbyjs/gatsby/issues/21840
  it(`returns a deterministic hash from a Buffer`, () => {
    const input = Buffer.from(`1234`)
    const input2 = Buffer.from(`1234`)

    expect(createContentDigest(input)).toEqual(createContentDigest(input2))
  })

  it(`returns a deterministic hash from an object`, () => {
    const input = {
      id: `12345`,
      args: {
        arg1: `test`,
        arg2: `test2`,
        arg3: [1, 2],
      },
    }
    const input2 = {
      args: {
        arg2: `test2`,
        arg1: `test`,
        arg3: [1, 2],
      },
      id: `12345`,
    }

    expect(createContentDigest(input)).toEqual(createContentDigest(input2))
  })

  it(`shouldn't threat arrays as deterministic by default`, () => {
    const input = {
      id: `12345`,
      args: {
        arg1: `test`,
        arg2: `test2`,
        arg3: [2, 1],
      },
    }
    const input2 = {
      args: {
        arg2: `test2`,
        arg1: `test`,
        arg3: [1, 2],
      },
      id: `12345`,
    }

    expect(createContentDigest(input)).not.toEqual(createContentDigest(input2))
  })
})
