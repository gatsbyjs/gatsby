const { TypeComposer, schemaComposer } = require(`graphql-compose`)
const { SchemaDirectiveVisitor } = require(`graphql-tools`)
const { GraphQLString } = require(`graphql`)

const { directives, visitors } = require(`..`)
const addResolvers = require(`../../schema/add-resolvers`)

const tc = TypeComposer.create(`
  type Foo {
    formattable: Date @dateformat
    formatted: Date @dateformat(format: "dd. MMMM yyyy", locale: "de")
    distanceToNow: Date @dateformat(distanceToNow: true, locale: "de")
  }
`)

addResolvers(tc)
schemaComposer.Query.addFields({ foo: tc.getResolver(`findOne`) })
const schema = schemaComposer.buildSchema({ directives })
SchemaDirectiveVisitor.visitSchemaDirectives(schema, visitors)

const Foo = schema.getType(`Foo`)
const fields = Foo.getFields()

describe(`@dateformat directive`, () => {
  it(`adds directive with default args`, () => {
    const formattableDirective = fields.formattable.astNode.directives[0]
    expect(formattableDirective.name.value).toBe(`dateformat`)
    expect(formattableDirective.arguments).toEqual([])

    const formattedDirective = fields.formatted.astNode.directives[0]
    expect(formattedDirective.name.value).toBe(`dateformat`)
    expect(formattedDirective.arguments.map(arg => arg.name.value)).toEqual([
      `format`,
      `locale`,
    ])

    const distanceToNowDirective = fields.distanceToNow.astNode.directives[0]
    expect(distanceToNowDirective.name.value).toBe(`dateformat`)
    expect(distanceToNowDirective.arguments.map(arg => arg.name.value)).toEqual(
      [`distanceToNow`, `locale`]
    )
  })

  it(`adds input args to field`, () => {
    expect(fields.formattable.args.map(arg => arg.name)).toEqual([
      `format`,
      `locale`,
      `timeZone`,
      `distanceToNow`,
    ])
    expect(fields.formatted.args.map(arg => arg.name)).toEqual([
      `format`,
      `locale`,
      `timeZone`,
      `distanceToNow`,
    ])
    expect(fields.distanceToNow.args.map(arg => arg.name)).toEqual([
      `format`,
      `locale`,
      `timeZone`,
      `distanceToNow`,
    ])
  })

  it(`adds field resolver`, () => {
    expect(fields.formattable.resolve).toBeInstanceOf(Function)
    expect(fields.formatted.resolve).toBeInstanceOf(Function)
    expect(fields.distanceToNow.resolve).toBeInstanceOf(Function)
  })

  it(`sets field type to String`, () => {
    expect(fields.formattable.type).toBe(GraphQLString)
    expect(fields.formatted.type).toBe(GraphQLString)
    expect(fields.distanceToNow.type).toBe(GraphQLString)
  })

  it(`keeps Date type of input filter`, () => {
    const filterFields = schema
      .getQueryType()
      .getFields()
      .foo.args[0].type.getFields()
    expect(filterFields.formattable.type.name).toBe(`DateQueryOperatorInput`)
    expect(filterFields.formatted.type.name).toBe(`DateQueryOperatorInput`)
    expect(filterFields.distanceToNow.type.name).toBe(`DateQueryOperatorInput`)
  })

  it(`uses default directive args`, async () => {
    const date = new Date(Date.UTC(2019, 0, 1))
    Date.now = jest.fn().mockReturnValue(new Date(Date.UTC(2019, 0, 3)))

    // defaultValue: "yyyy-MM-dd", "en-US", "UTC", false
    const formattableDate = await fields.formattable.resolve(
      { date },
      {},
      {},
      { fieldName: `date` }
    )
    expect(formattableDate).toBe(`2019-01-01`)

    // default format: "dd. MMMM yyyy", default locale: "de"
    const formattedDate = await fields.formatted.resolve(
      { date },
      {},
      {},
      { fieldName: `date` }
    )
    expect(formattedDate).toBe(`01. Januar 2019`)

    // default distanceToNow: true, default locale: "de"
    const distanceToNow = await fields.distanceToNow.resolve(
      { date },
      {},
      {},
      { fieldName: `date` }
    )
    expect(distanceToNow).toBe(`letzten Dienstag um 01:00`)
  })

  it(`uses input args`, async () => {
    const date = new Date(Date.UTC(2019, 0, 1))
    Date.now = jest.fn().mockReturnValue(new Date(Date.UTC(2019, 0, 3)))

    const formattableDate = await fields.formattable.resolve(
      { date },
      { format: `yyyy` },
      {},
      { fieldName: `date` }
    )
    expect(formattableDate).toBe(`2019`)

    const formattedDate = await fields.formatted.resolve(
      { date },
      { format: `yyyy` },
      {},
      { fieldName: `date` }
    )
    expect(formattedDate).toBe(`2019`)

    // NOTE: If you set default `distanceToNow: true`, you need to
    // explicitly disable it for formatting args to take effect.
    const distanceToNow = await fields.distanceToNow.resolve(
      { date },
      { format: `yyyy`, distanceToNow: false },
      {},
      { fieldName: `date` }
    )
    expect(distanceToNow).toBe(`2019`)
  })
})
