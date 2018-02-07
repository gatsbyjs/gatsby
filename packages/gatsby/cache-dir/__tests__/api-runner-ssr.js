const { duplicatedApis } = require(`../api-runner-ssr`)

describe(`duplicatedApis`, () => {
  it(`identifies duplicate apis`, () => {
    const result = duplicatedApis(
      [
        {
          plugin: {
            replaceRenderer: () => {},
            otherApi: () => {},
          },
          path: `/path/to/foo.js`,
        },
        {
          plugin: {
            replaceRenderer: () => {},
            differentApi: () => {},
          },
          path: `/path/to/bar.js`,
        },
      ],
      `replaceRenderer`
    )
    expect(result).toEqual([`/path/to/foo.js`, `/path/to/bar.js`])
  })

  it(`only identifies the specified duplicate`, () => {
    const result = duplicatedApis(
      [
        {
          plugin: {
            replaceRenderer: () => {},
          },
          path: `/path/to/foo.js`,
        },
        {
          plugin: {
            otherDuplicate: () => {},
            replaceRenderer: () => {},
          },
          path: `/path/to/bar.js`,
        },
        {
          plugin: {
            otherDuplicate: () => {},
            replaceRenderer: () => {},
          },
          path: `/path/to/baz.js`,
        },
      ],
      `otherDuplicate`
    )
    expect(result).toEqual([`/path/to/bar.js`, `/path/to/baz.js`])
  })

  it(`correctly identifies no duplicates`, () => {
    const result = duplicatedApis(
      [
        {
          plugin: {
            uniqueApi1: () => {},
          },
          path: `/path/to/foo.js`,
        },
        {
          plugin: {
            uniqueApi2: () => {},
          },
          path: `/path/to/bar.js`,
        },
      ],
      `uniqueApi1`
    )
    expect(result).toEqual([])
  })
})
