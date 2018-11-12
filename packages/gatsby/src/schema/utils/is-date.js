// Maybe FIXME: Currently, number strings like "404" are interpreted
// as a year, i.e. a Date. This is problematic for File.name - but,
// `gatsby-source-filesystem` should provide `typeDefs` anyway.
const isDate = string => isFinite(new Date(string).getTime())

module.exports = isDate
