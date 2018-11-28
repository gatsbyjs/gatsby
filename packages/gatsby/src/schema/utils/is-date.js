// FIXME: Currently, number strings like "404" are interpreted
// as a year, i.e. a Date.
// FIXME: Interesting weirdness: "13"-"31" are invalid Dates.
// Not entirely sure what the [spec](http://www.ecma-international.org/ecma-262/6.0/#sec-date-time-string-format)
// says here.
const isDate = string => isFinite(new Date(string).getTime())

module.exports = isDate
