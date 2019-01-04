const {
  defaultFieldResolver,
  DirectiveLocation,
  GraphQLDirective,
  GraphQLString,
  GraphQLBoolean,
} = require(`graphql`)
const { SchemaDirectiveVisitor } = require(`graphql-tools`)
const { format, distanceInWordsToNow } = require(`date-fns`)

const formatDate = (date, pattern, lang, timeZone, distanceToNow) => {
  const locale = lang && require(`date-fns/locale/${lang}`)
  return distanceToNow
    ? distanceInWordsToNow(date, { locale })
    : format(date, pattern, {
        locale,
        // timeZone, // IANA time zone, needs `date-fns-timezone`
      })
}

const DateFormatDirective = new GraphQLDirective({
  name: `dateformat`,
  locations: [DirectiveLocation.FIELD_DEFINITION],
})

// @see https://www.apollographql.com/docs/graphql-tools/schema-directives.html#Formatting-date-strings
class DateFormatDirectiveVisitor extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field

    field.args.push(
      { name: `format`, type: GraphQLString },
      { name: `locale`, type: GraphQLString },
      { name: `timeZone`, type: GraphQLString },
      { name: `distanceToNow`, type: GraphQLBoolean }
    )

    field.resolve = async (source, args, context, info) => {
      const { format, locale, timeZone, distanceToNow, ...rest } = args
      const date = await resolve(source, rest, context, info)
      const shouldReturnFormattedString =
        format || locale || timeZone || distanceToNow
      if (shouldReturnFormattedString) {
        info.returnType = GraphQLString
        return formatDate(date, format, locale, timeZone, distanceToNow)
      }
      return date
    }
  }
}

module.exports = [
  DateFormatDirective,
  { dateformat: DateFormatDirectiveVisitor },
]
