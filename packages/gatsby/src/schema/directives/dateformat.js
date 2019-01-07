const {
  defaultFieldResolver,
  DirectiveLocation,
  GraphQLDirective,
  GraphQLString,
  GraphQLBoolean,
} = require(`graphql`)
const { SchemaDirectiveVisitor } = require(`graphql-tools`)
const format = require(`date-fns/format`)
const formatRelative = require(`date-fns/formatRelative`)

// UPSTREAM: GraphQLDate.parseLiteral should accept date strings in other
// formats but toISOString

const formatDate = (date, pattern, lang, timeZone, distanceToNow) => {
  const locale = lang && require(`date-fns/locale/${lang}`)
  return distanceToNow
    ? formatRelative(date, Date.now(), { locale }) // TODO: Use formatDistanceStrict?
    : format(date, pattern, {
        locale,
        // timeZone, // IANA time zone, needs `date-fns-tz`
      })
}

const DateFormatDirective = new GraphQLDirective({
  name: `dateformat`,
  locations: [DirectiveLocation.FIELD_DEFINITION],
  args: {
    format: { type: GraphQLString, defaultValue: `yyyy-MM-dd` },
    locale: { type: GraphQLString, defaultValue: `en-US` },
    timeZone: { type: GraphQLString, defaultValue: `UTC` },
    distanceToNow: { type: GraphQLBoolean, defaultValue: false },
  },
})

// @see https://www.apollographql.com/docs/graphql-tools/schema-directives.html#Formatting-date-strings
class DateFormatDirectiveVisitor extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field
    const {
      format: defaultFormat,
      locale: defaultLocale,
      timeZone: defaultTimeZone,
      distanceToNow: defaultDistanceToNow,
    } = this.args

    field.args.push(
      { name: `format`, type: GraphQLString },
      { name: `locale`, type: GraphQLString },
      { name: `timeZone`, type: GraphQLString },
      { name: `distanceToNow`, type: GraphQLBoolean }
    )

    field.resolve = async (source, args, context, info) => {
      const { format, locale, timeZone, distanceToNow, ...rest } = args
      const date = await resolve(source, rest, context, info)
      return formatDate(
        date,
        format || defaultFormat,
        locale || defaultLocale,
        timeZone || defaultTimeZone,
        distanceToNow !== undefined ? distanceToNow : defaultDistanceToNow
      )
    }

    field.type = GraphQLString
  }
}

module.exports = [
  DateFormatDirective,
  { dateformat: DateFormatDirectiveVisitor },
]
