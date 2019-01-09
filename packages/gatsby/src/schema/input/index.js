// const { toInputObjectType } = require(`graphql-compose`)

const getFilterInput = require(`./filter`)
const getSortInput = require(`./sort`)

// FIXME: UPSTREAM: graphql-compose:toInputObjectType
// * either allow passing cache instance to getITC, not only to
//   toInputObjectType, or call getITC instead of toInputObjectType
//   in convertInputObjectField so that the itc gets stuck on the tc.
// * no need to prefix input types in toInputObjectType, since typenames
//   should already be unique.
// * allow option to drop type modifiers, since types are already being
//   unwrapped

// const cache = new Map()

const getInputArgs = tc => {
  // const itc = toInputObjectType(tc, {}, cache)
  const itc = tc.getITC()

  const FilterInput = getFilterInput(itc)
  const SortInput = getSortInput(itc)
  return [FilterInput, SortInput]
}

module.exports = {
  getInputArgs,
}
