const {
  extractFieldExamples,
  buildFieldEnumValues,
  INVALID_VALUE,
} = require(`../data-tree-utils`)

describe(`Gatsby data tree utils`, () => {
  const nodes = [
    {
      name: `The Mad Max`,
      hair: 1,
      date: `2006-07-22T22:39:53.000Z`,
      'key-with..unsupported-values': true,
      emptyArray: [],
      anArray: [1, 2, 3, 4],
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of dash and adventure`,
        blue: 100,
      },
    },
    {
      name: `The Mad Wax`,
      hair: 2,
      date: `2006-07-22T22:39:53.000Z`,
      emptyArray: [undefined, null],
      anArray: [1, 2, 5, 4],
      iAmNull: null,
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of slash and adventure`,
        blue: 10010,
        circle: `happy`,
        draft: false,
      },
    },
    {
      name: `The Mad Wax`,
      hair: 3,
      date: `2006-07-22T22:39:53.000Z`,
      anArray: [],
      iAmNull: null,
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of slash and adventure`,
        blue: 10010,
        circle: `happy`,
        draft: false,
      },
    },
    {
      name: `The Mad Wax`,
      hair: 4,
      date: `2006-07-22T22:39:53.000Z`,
      anArray: [4, 6, 2],
      iAmNull: null,
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of slash and adventure`,
        blue: 10010,
        circle: `happy`,
        draft: false,
      },
    },
  ]

  it(`builds field examples from an array of nodes`, () => {
    expect(extractFieldExamples(nodes)).toMatchSnapshot()
  })

  it(`null fields should have a null value`, () => {
    expect(extractFieldExamples(nodes).iAmNull).toBeNull()
  })

  it(`turns empty or sparse arrays to null`, () => {
    expect(extractFieldExamples(nodes).emptyArray).toBeNull()
    expect(extractFieldExamples(nodes).hair).toBeDefined()
  })

  it(`build enum values for fields from array on nodes`, () => {
    expect(buildFieldEnumValues(nodes)).toMatchSnapshot()
  })

  it(`turns polymorphic fields null`, () => {
    let example = extractFieldExamples([
      { foo: null },
      { foo: [1] },
      { foo: { field: 1 } },
    ])
    expect(example.foo).toBe(INVALID_VALUE)
  })

  it(`handles polymorphic arrays`, () => {
    let example = extractFieldExamples([
      { foo: [[`foo`, `bar`]] },
      { foo: [{ field: 1 }] },
    ])
    expect(example.foo).toBe(INVALID_VALUE)
  })

  it(`doesn't confuse empty fields for polymorhpic ones`, () => {
    let example = extractFieldExamples([
      { foo: { bar: 1 } },
      { foo: null },
      { foo: { field: 1 } },
    ])
    expect(example.foo).toEqual({ field: 1, bar: 1 })

    example = extractFieldExamples([
      { foo: [{ bar: 1 }] },
      { foo: null },
      { foo: [{ field: 1 }, { baz: 1 }] },
    ])
    expect(example.foo).toEqual([{ field: 1, bar: 1, baz: 1 }])
  })
})
