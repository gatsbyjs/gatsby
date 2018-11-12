const {
  defaultFieldResolver,
  DirectiveLocation,
  GraphQLDirective,
  GraphQLString,
} = require(`graphql`)
const { SchemaDirectiveVisitor } = require(`graphql-tools`)

const formatDate = (date, format, locale, timeZone) =>
  // Node.js internationalization support would probably be enough,
  // but that's a build-time option.
  // TODO: Use either `dateformat`, `date-fns`, or `dayjs`.
  new Date(date).toLocaleString(locale, { timeZone: timeZone })

const DateFormatDirective = new GraphQLDirective({
  name: `dateformat`,
  locations: [DirectiveLocation.FIELD_DEFINITION],
  args: {
    defaultFormat: { type: GraphQLString, defaultValue: `MM DD YYYY` },
    defaultLocale: { type: GraphQLString, defaultValue: `en-US` },
    defaultTimeZone: { type: GraphQLString, defaultValue: `UTC` },
  },
})

// @see https://www.apollographql.com/docs/graphql-tools/schema-directives.html#Formatting-date-strings
class DateFormatDirectiveVisitor extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field
    const { defaultFormat, defaultLocale, defaultTimeZone } = this.args

    field.args.push(
      { name: `format`, type: GraphQLString },
      { name: `locale`, type: GraphQLString },
      { name: `timeZone`, type: GraphQLString }
    )

    field.resolve = async (source, args, context, info) => {
      const { format, locale, timeZone, ...rest } = args
      const date = await resolve(source, rest, context, info)
      return formatDate(
        date,
        format || defaultFormat,
        locale || defaultLocale,
        timeZone || defaultTimeZone
      )
    }

    field.type = GraphQLString
  }
}

module.exports = [
  DateFormatDirective,
  { dateformat: DateFormatDirectiveVisitor },
]
