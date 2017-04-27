const {
  extractFieldExamples,
  buildFieldEnumValues,
} = require("../data-tree-utils")

describe(`Gatsby data tree utils`, () => {
  const nodes = [
    {
      name: `The Mad Max`,
      hair: 1,
      date: `2006-07-22T22:39:53.000Z`,
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
    expect(extractFieldExamples({ nodes })).toMatchSnapshot()
  })

  it(`ignores fields that have a null value`, () => {
    expect(extractFieldExamples({ nodes }).iAmNull).not.toBeDefined()
  })

  it(`ignores empty arrays`, () => {
    expect(extractFieldExamples({ nodes }).emptyArray).not.toBeDefined()
    expect(extractFieldExamples({ nodes }).hair).toBeDefined()
  })

  it(`build enum values for fields from array on nodes`, () => {
    expect(buildFieldEnumValues(nodes)).toMatchSnapshot()
  })
})
