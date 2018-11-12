const defaultDirectives = require(`./defaults`)
const [DateFormatDirective, dateFormatVisitor] = require(`./dateformat`)
const [LinkNodeDirective, linkNodeVisitor] = require(`./link-node`)

const directives = [
  ...defaultDirectives,
  DateFormatDirective,
  LinkNodeDirective,
]

const visitors = {
  ...dateFormatVisitor,
  ...linkNodeVisitor,
}

module.exports = {
  directives,
  visitors,
}
