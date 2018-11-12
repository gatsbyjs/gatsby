const { InputTypeComposer } = require(`graphql-compose`)

const EQ = `eq`
const NE = `ne`
const GT = `gt`
const GTE = `gte`
const LT = `lt`
const LTE = `lte`
const IN = `in[]`
const NIN = `nin[]`
const REGEX = `regex`
const GLOB = `glob`
// const ELEMMATCH = 'elemMatch';
// const WHERE = 'where';
// const AND; OR; NOT; NOR;
// const SIZE;

const allowedOperators = {
  Boolean: [EQ, NE],
  Date: [EQ, NE, GT, GTE, LT, LTE, IN, NIN],
  Float: [EQ, NE, GT, GTE, LT, LTE, IN, NIN],
  ID: [EQ, NE, IN, NIN],
  Int: [EQ, NE, GT, GTE, LT, LTE, IN, NIN],
  // JSON: [EQ, NE],
  String: [EQ, NE, IN, NIN, REGEX, GLOB],
}

const addOperators = (fieldType, operators) =>
  operators.reduce((acc, op) => {
    if (op.slice(-2) === `[]`) {
      acc[op.slice(0, -2)] = `[${fieldType}]`
    } else {
      acc[op] = fieldType
    }
    return acc
  }, {})

const operatorFields = Object.entries(allowedOperators).reduce(
  (acc, [type, operators]) => {
    acc[type] = InputTypeComposer.create({
      name: type + `QueryOperatorInput`,
      fields: addOperators(type, operators),
    })
    return acc
  },
  {}
)

const getQueryOperators = type => operatorFields[type]

module.exports = getQueryOperators
