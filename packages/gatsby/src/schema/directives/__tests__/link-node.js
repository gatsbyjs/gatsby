const { TypeComposer, schemaComposer } = require(`graphql-compose`)
const { SchemaDirectiveVisitor } = require(`graphql-tools`)

const { directives, visitors } = require(`..`)
const addResolvers = require(`../../schema/add-resolvers`)

TypeComposer.create(`type Bar { id: ID, bar: String }`)
const tc = TypeComposer.create(`
  type Foo {
    link: Bar @link
    links: [Bar] @link
    linkBy: Bar @link(by: "bar")
  }
`)

addResolvers(tc)
schemaComposer.Query.addFields({ foo: tc.getResolver(`findOne`) })
const schema = schemaComposer.buildSchema({ directives })
SchemaDirectiveVisitor.visitSchemaDirectives(schema, visitors)

const Foo = schema.getType(`Foo`)
const fields = Foo.getFields()

describe(`@link directive`, () => {
  it(`adds directive`, () => {
    const linkDirective = fields.link.astNode.directives[0]
    expect(linkDirective.name.value).toBe(`link`)
    // Where is the defaultValue?

    const linksDirective = fields.links.astNode.directives[0]
    expect(linksDirective.name.value).toBe(`link`)
    // Where is the defaultValue?

    const linkByDirective = fields.linkBy.astNode.directives[0]
    expect(linkByDirective.name.value).toBe(`link`)
    expect(linkByDirective.arguments[0].name.value).toBe(`by`)
    expect(linkByDirective.arguments[0].value.value).toBe(`bar`)
  })

  it(`adds resolver`, () => {
    expect(fields.link.resolve).toBeInstanceOf(Function)
    expect(fields.links.resolve).toBeInstanceOf(Function)
    expect(fields.linkBy.resolve).toBeInstanceOf(Function)
  })
})
