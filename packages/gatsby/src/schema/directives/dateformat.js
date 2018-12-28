const {
  defaultFieldResolver,
  DirectiveLocation,
  GraphQLDirective,
  GraphQLString,
  GraphQLBoolean,
} = require(`graphql`)
const { SchemaDirectiveVisitor } = require(`graphql-tools`)
const { format, distanceInWordsToNow } = require(`date-fns`)

// `date-fns-timezone` (compatible with v1): `formatToTimeZone(date, pattern. { locale, timeZone })`
// `date-fns-tz` (compatible with v2): `format(date, pattern. { locale, timeZone })`
// When updating to `date-fns` v2, don't forget that locale
// names have changed!
// Also: distanceInWordsFromNow => formatDistance/formatRelative(date, baseDate, { locale })

// Keep an eye on Intl.DateTimeFormat and Intl.RelativeTimeFormat

// full-icu support can be enabled in Node with `yarn add full-icu` and
// setting NODE_ICU_DATA=./node_modules/full-icu

const formatDate = (date, pattern, lang, timeZone, distanceToNow) => {
  // return new Date(date).toLocaleString(locale, { timeZone: timeZone })
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
  args: {
    defaultFormat: { type: GraphQLString, defaultValue: `YYYY-MM-DD` },
    defaultLocale: { type: GraphQLString, defaultValue: `en` },
    defaultTimeZone: { type: GraphQLString, defaultValue: `UTC` },
    defaultDistanceToNow: { type: GraphQLBoolean, defaultValue: false },
  },
})

// @see https://www.apollographql.com/docs/graphql-tools/schema-directives.html#Formatting-date-strings
class DateFormatDirectiveVisitor extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field
    const {
      defaultFormat,
      defaultLocale,
      defaultTimeZone,
      defaultDistanceToNow,
    } = this.args

    // field.args.push(
    //   { name: `format`, type: GraphQLString },
    //   { name: `locale`, type: GraphQLString },
    //   { name: `timeZone`, type: GraphQLString },
    //   { name: `distanceToNow`, type: GraphQLBoolean }
    // )
    field.args = [
      { name: `format`, type: GraphQLString },
      { name: `locale`, type: GraphQLString },
      { name: `timeZone`, type: GraphQLString },
      { name: `distanceToNow`, type: GraphQLBoolean },
    ]

    field.resolve = async (source, args, context, info) => {
      const { format, locale, timeZone, distanceToNow, ...rest } = args
      const date = await resolve(source, rest, context, info)
      return formatDate(
        date,
        format || defaultFormat,
        locale || defaultLocale,
        timeZone || defaultTimeZone,
        distanceToNow || defaultDistanceToNow
      )
    }

    field.type = GraphQLString
  }
}

module.exports = [
  DateFormatDirective,
  { dateformat: DateFormatDirectiveVisitor },
]
