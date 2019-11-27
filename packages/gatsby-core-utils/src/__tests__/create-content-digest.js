const createContentDigest = require(`../create-content-digest`)

describe(`Create content digest`, () => {
  it(`returns the content digest when the input is a string`, () => {
    const input = `this is a string`

    const contentDigest = createContentDigest(input)

    expect(typeof contentDigest).toEqual(`string`)
    expect(contentDigest).toMatchInlineSnapshot(
      `"41e0e061ebde15ed7474b047b2a962c5"`
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

  it(`should threat arrays as deterministic when set`, () => {
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
        arg3: [1, 2],
        arg2: `test2`,
        arg1: `test`,
      },
      id: `12345`,
    }

    expect(createContentDigest(input, { sortArrays: true })).toEqual(
      createContentDigest(input2, { sortArrays: true })
    )
  })
})
