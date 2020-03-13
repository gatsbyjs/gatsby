const { prepareRegex } = require(`../prepare-regex`)

describe(`Prepare regex for Sift.js`, () => {
  it(`handles simple regex`, () => {
    expect(prepareRegex(`/blue/`)).toMatchSnapshot()
  })

  it(`handles flags regex`, () => {
    expect(prepareRegex(`/blue/i`)).toMatchSnapshot()
  })

  it(`handles slashes`, () => {
    expect(prepareRegex(`/bl/ue/i`)).toMatchSnapshot()
  })

  it(`handles escape sequences`, () => {
    const expected = /^\w+\d{2}\.$/
    expect(prepareRegex(`/^\\w+\\d{2}\\.$/`)).toEqual(expected)
  })

  it(`handles regex string passed as graphql arg`, async () => {
    const {
      GraphQLSchema,
      GraphQLObjectType,
      GraphQLString,
      graphql,
    } = require(`graphql`)
    const QueryType = new GraphQLObjectType({
      name: `Query`,
      fields: {
        regex: {
          type: GraphQLString,
          args: {
            regex: { type: GraphQLString },
          },
          resolve: (source, args) => args.regex,
        },
      },
    })
    const schema = new GraphQLSchema({ query: QueryType })
    /* prettier-ignore */
    const results = await graphql(
      schema,
      `
        {
          regex(regex: "/\\\\w+/")
        }
      `
    )
    expect(results.errors).toBeUndefined()
    expect(results.data).toEqual({ regex: `/\\w+/` })

    const expected = /\w+/
    expect(prepareRegex(results.data.regex)).toEqual(expected)
  })
})
