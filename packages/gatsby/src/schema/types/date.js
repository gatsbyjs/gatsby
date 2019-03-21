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
  `YYYY-MM-DDTHH:mm:ss.SSSSSS`,
  `YYYY-MM-DDTHHmmss.SSSSSS`,
  // `YYYY-MM-DDTHH:mm:ss.SSSSSSSSS`,
  // `YYYY-MM-DDTHHmmss.SSSSSSSSS`,

  // Local Time (Omit T)
  `YYYY-MM-DD HH`,
  `YYYY-MM-DD HH:mm`,
  `YYYY-MM-DD HHmm`,
  `YYYY-MM-DD HH:mm:ss`,
  `YYYY-MM-DD HHmmss`,
  `YYYY-MM-DD HH:mm:ss.SSS`,
  `YYYY-MM-DD HHmmss.SSS`,
  `YYYY-MM-DD HH:mm:ss.SSSSSS`,
  `YYYY-MM-DD HHmmss.SSSSSS`,
  // `YYYY-MM-DD HH:mm:ss.SSSSSSSSS`,
  // `YYYY-MM-DD HHmmss.SSSSSSSSS`,

  // Coordinated Universal Time (UTC)
  `YYYY-MM-DDTHHZ`,
  `YYYY-MM-DDTHH:mmZ`,
  `YYYY-MM-DDTHHmmZ`,
  `YYYY-MM-DDTHH:mm:ssZ`,
  `YYYY-MM-DDTHHmmssZ`,
  `YYYY-MM-DDTHH:mm:ss.SSSZ`,
  `YYYY-MM-DDTHHmmss.SSSZ`,
  `YYYY-MM-DDTHH:mm:ss.SSSSSSZ`,
  `YYYY-MM-DDTHHmmss.SSSSSSZ`,
  // `YYYY-MM-DDTHH:mm:ss.SSSSSSSSSZ`,
  // `YYYY-MM-DDTHHmmss.SSSSSSSSSZ`,

  // Coordinated Universal Time (UTC) (Omit T)
  `YYYY-MM-DD HHZ`,
  `YYYY-MM-DD HH:mmZ`,
  `YYYY-MM-DD HHmmZ`,
  `YYYY-MM-DD HH:mm:ssZ`,
  `YYYY-MM-DD HHmmssZ`,
  `YYYY-MM-DD HH:mm:ss.SSSZ`,
  `YYYY-MM-DD HHmmss.SSSZ`,
  `YYYY-MM-DD HH:mm:ss.SSSSSSZ`,
  `YYYY-MM-DD HHmmss.SSSSSSZ`,
  // `YYYY-MM-DD HH:mm:ss.SSSSSSSSSZ`,
  // `YYYY-MM-DD HHmmss.SSSSSSSSSZ`,

  // Coordinated Universal Time (UTC) (Omit T, Extra Space before Z)
  `YYYY-MM-DD HH Z`,
  `YYYY-MM-DD HH:mm Z`,
  `YYYY-MM-DD HHmm Z`,
  `YYYY-MM-DD HH:mm:ss Z`,
  `YYYY-MM-DD HHmmss Z`,
  `YYYY-MM-DD HH:mm:ss.SSS Z`,
  `YYYY-MM-DD HHmmss.SSS Z`,
  `YYYY-MM-DD HH:mm:ss.SSSSSS Z`,
  `YYYY-MM-DD HHmmss.SSSSSS Z`,

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

const momentFormattingTokens = /(\[[^[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g
const momentFormattingRegexes = {
  YYYY: `\\d{4}`,
  MM: `\\d{2}`,
  DD: `\\d{2}`,
  HH: `\\d{2}`,
  mm: `\\d{2}`,
  ss: `\\d{2}`,
  SSS: `\\d{3}`,
  SSSSSS: `\\d{6}`,
  "[W]": `W`,
  ".": `\\.`,
}
const ISO_8601_FORMAT_AS_REGEX = ISO_8601_FORMAT.map(format =>
  // convert ISO string to a map of momentTokens ([YYYY, MM, DD])
  [...format.match(momentFormattingTokens)]
    .map(token =>
      // see if the token (YYYY or ss) is found, else we just return the value
      momentFormattingRegexes[token] ? momentFormattingRegexes[token] : token
    )
    .join(``)
).join(`|`)

// calculate all lengths of the formats, if a string is longer or smaller it can't be valid
const ISO_8601_FORMAT_LENGTHS = [
  ...new Set(ISO_8601_FORMAT.map(str => str.length)),
]
// lets imagine these formats: YYYY-MM-DDTHH & YYYY-MM-DD HHmmss.SSSSSS Z
// this regex looks like (/^(\d{4}-\d{2}-\d{2}T\d{2}|\d{4}-\d{2}-\d{2} \d{2}\d{2}\d{2}.\d{6} Z)$)
const quickDateValidateRegex = new RegExp(`^(${ISO_8601_FORMAT_AS_REGEX})$`)

const looksLikeDateStartRegex = /^\d{4}/
// this regex makes sure the last characters are looking like a string and not a guid
const looksLikeDateEndRegex = /((\d|-|T|W| |:)\d{2}|[:-]\d|\d:\dZ|\d{2}Z| Z)$/

/**
 * isDate does 5 quickchecks & fallsback to momentjs to check if it's a valid date
 * 1) is it a number?
 * 2) does the length of the value comply with any of our formats
 * 3) does the str starts with 4 digites (YYYY)
 * 4) does the str ends with something that looks like a date
 * 5) Small regex to see if it matches any of the formats
 * 6) check momentjs
 *
 * @param {string|number} value
 * @return {boolean}
 */
function isDate(value) {
  // quick check if value does not look like a date
  if (
    typeof value === `number` ||
    !ISO_8601_FORMAT_LENGTHS.includes(value.length) ||
    !looksLikeDateStartRegex.test(value) ||
    !looksLikeDateEndRegex.test(value)
  ) {
    return false
  }

  // If it looks like a date we parse the date with a regex to see if we can handle it.
  // momentjs just does regex validation itself if you don't do any operations on it.
  if (quickDateValidateRegex.test(value)) {
    return true
  }

  const momentDate = moment.utc(value, ISO_8601_FORMAT, true)
  return momentDate.isValid()
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
