const { buildSchema, printSchema } = require(`gatsby/graphql`)
const {
  NamespaceUnderFieldTransform,
  StripNonQueryTransform,
} = require(`../transforms`)

const sdl = `
  type Query {
    query: String
  }

  type Mutation {
    mutation: String
  }
`

describe(`NamespaceUnderFieldTransform`, () => {
  it(`works`, () => {
    const schema = buildSchema(sdl)

    const transform = new NamespaceUnderFieldTransform({
      typeName: `Wrapper`,
      fieldName: `wrapper`,
      resolver: () => {},
    })
    const transformedSchema = transform.transformSchema(schema)
    const transformedSdl = printSchema(transformedSchema)

    expect(transformedSdl).toMatchSnapshot()
  })
})

describe(`StripNonQueryTransform`, () => {
  it(`works`, () => {
    const schema = buildSchema(sdl)

    const transform = new StripNonQueryTransform()
    const transformedSchema = transform.transformSchema(schema)
    const transformedSdl = printSchema(transformedSchema)

    expect(transformedSdl).toMatchSnapshot()
  })
})
