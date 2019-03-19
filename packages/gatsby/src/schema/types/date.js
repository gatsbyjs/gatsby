const moment = require(`moment`)
const {
  GraphQLString,
  GraphQLBoolean,
  GraphQLScalarType,
  Kind,
} = require(`graphql`)
const { oneLine } = require(`common-tags`)

const ISO_8601_FORMAT = [
  `YYYY`,
  `YYYY-MM`,
  `YYYY-MM-DD`,
  `YYYYMMDD`,

  // Local Time
  `YYYY-MM-DDTHH`,
  `YYYY-MM-DDTHH:mm`,
  `YYYY-MM-DDTHHmm`,
  `YYYY-MM-DDTHH:mm:ss`,
  `YYYY-MM-DDTHHmmss`,
  `YYYY-MM-DDTHH:mm:ss.SSS`,
  `YYYY-MM-DDTHHmmss.SSS`,

  // Coordinated Universal Time (UTC)
  `YYYY-MM-DDTHHZ`,
  `YYYY-MM-DDTHH:mmZ`,
  `YYYY-MM-DDTHHmmZ`,
  `YYYY-MM-DDTHH:mm:ssZ`,
  `YYYY-MM-DDTHHmmssZ`,
  `YYYY-MM-DDTHH:mm:ss.SSSZ`,
  `YYYY-MM-DDTHHmmss.SSSZ`,

  `YYYY-[W]WW`,
  `YYYY[W]WW`,
  `YYYY-[W]WW-E`,
  `YYYY[W]WWE`,
  `YYYY-DDDD`,
  `YYYYDDDD`,
]

const GraphQLDate = new GraphQLScalarType({
  name: `Date`,
  description: oneLine`
    A date string, such as 2007-12-03, compliant with the ISO 8601 standard
    for representation of dates and times using the Gregorian calendar.`,
  serialize: String,
  parseValue: String,
  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? ast.value : undefined
  },
})

// Check if this is a date.
// All the allowed ISO 8601 date-time formats used.
function isDate(value) {
  const momentDate = moment.utc(value, ISO_8601_FORMAT, true)
  return momentDate.isValid() && typeof value !== `number`
}

const formatDate = ({
  date,
  fromNow,
  difference,
  formatString,
  locale = `en`,
}) => {
  const normalizedDate = JSON.parse(JSON.stringify(date))
  if (formatString) {
    return moment
      .utc(normalizedDate, ISO_8601_FORMAT, true)
      .locale(locale)
      .format(formatString)
  } else if (fromNow) {
    return moment
      .utc(normalizedDate, ISO_8601_FORMAT, true)
      .locale(locale)
      .fromNow()
  } else if (difference) {
    return moment().diff(
      moment.utc(normalizedDate, ISO_8601_FORMAT, true).locale(locale),
      difference
    )
  }
  return normalizedDate
}

const dateResolver = {
  type: `Date`,
  args: {
    formatString: {
      type: GraphQLString,
      description: oneLine`
        Format the date using Moment.js' date tokens, e.g.
        \`date(formatString: "YYYY MMMM DD")\`.
        See https://momentjs.com/docs/#/displaying/format/
        for documentation for different tokens.`,
    },
    fromNow: {
      type: GraphQLBoolean,
      description: oneLine`
        Returns a string generated with Moment.js' \`fromNow\` function`,
    },
    difference: {
      type: GraphQLString,
      description: oneLine`
        Returns the difference between this date and the current time.
        Defaults to "miliseconds" but you can also pass in as the
        measurement "years", "months", "weeks", "days", "hours", "minutes",
        and "seconds".`,
    },
    locale: {
      type: GraphQLString,
      description: oneLine`
        Configures the locale Moment.js will use to format the date.`,
    },
  },
  resolve(source, args, context, { fieldName }) {
    const date = source[fieldName]
    if (date == null) return null

    return Array.isArray(date)
      ? date.map(d => formatDate({ date: d, ...args }))
      : formatDate({ date, ...args })
  },
}

module.exports = { GraphQLDate, dateResolver, isDate }
