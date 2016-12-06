const { extractFieldExamples, buildFieldEnumValues } = require(`../ast-utils`)

describe(`Gatsby AST utils`, () => {
  const nodes = [
    {
      name: `The Mad Max`,
      hair: 1,
      date: `2006-07-22T22:39:53.000Z`,
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
      frontmatter: {
        date: `2006-07-22T22:39:53.000Z`,
        title: `The world of slash and adventure`,
        blue: 10010,
      },
    },
  ]

  it(`builds field examples from an array of nodes`, () => {
    expect(extractFieldExamples({ nodes })).toMatchSnapshot()
  })

  it(`build enum values for fields from array on nodes`, () => {
    expect(buildFieldEnumValues(nodes)).toMatchSnapshot()
  })
})
