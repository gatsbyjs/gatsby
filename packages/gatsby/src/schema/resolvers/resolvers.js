const { getById } = require(`../db`)
const { equals, oneOf, query } = require(`../query`)
const { isObject } = require(`../utils`)
const getNodesForQuery = require(`./get-nodes-for-query`)
const withPageDependencies = require(`./page-dependencies`)
const withSpecialCases = require(`./special-cases`)

const link = ({ by }) => resolve => (source, args, context, info) => {
  const fieldValue = source[info.fieldName]

  if (fieldValue == null || isObject(fieldValue)) return fieldValue
  if (
    Array.isArray(fieldValue) &&
    (fieldValue[0] == null || isObject(fieldValue[0]))
  ) {
    return fieldValue
  }

  if (by === `id`) {
    const [resolve, key] = Array.isArray(fieldValue)
      ? [findByIds, `ids`]
      : [findById, `id`]
    return withPageDependencies(resolve)()({
      source,
      args: { [key]: fieldValue },
      context,
      info,
    })
  }

  const operator = Array.isArray(fieldValue) ? oneOf : equals
  args.filter = by.split(`.`).reduceRight((acc, key, i, { length }) => {
    return {
      [key]: i === length - 1 ? operator(acc) : acc,
    }
  }, fieldValue)
  return resolve({ source, args, context, info })
}

const findById = () => ({ args }) => getById(args.id)

const findByIds = () => ({ args }) =>
  Array.isArray(args.ids) ? args.ids.map(getById).filter(Boolean) : []

// TODO: Should we merge this with `findByIds`?
// Or: Split in `findChildOfType` and `findChildrenOfType`,
const findByIdsAndType = type => ({ args }, firstResultOnly) =>
  Array.isArray(args.ids)
    ? args.ids
        .map(getById)
        [firstResultOnly ? `find` : `filter`](
          node => node && node.internal.type === type
        ) || null
    : firstResultOnly
      ? null
      : []

const find = type => async (rp, firstResultOnly) => {
  const queryArgs = withSpecialCases({ type, ...rp })
  return query(
    await getNodesForQuery(type, queryArgs.filter, rp.context),
    queryArgs,
    firstResultOnly
  )
}

const findMany = type => async rp => (await find(type)(rp, false)).items

const findOne = type => rp => find(type)(rp, true)

const paginate = type => async rp => {
  const { items, count } = await find(type)(rp, false)

  // const { page = 1, perPage } = rp.args
  // const pageCount = Math.ceil(count / perPage)
  // const currentPage = page
  // const hasPreviousPage = page > 1
  // const hasNextPage = page * perPage < count // currentPage < pageCount

  const { skip = 0, limit } = rp.args
  const pageCount = Math.ceil(skip / limit) + Math.ceil((count - skip) / limit)
  const currentPage = Math.ceil(skip / limit) + 1 // Math.min(currentPage, pageCount)
  const hasPreviousPage = currentPage > 1
  const hasNextPage = skip + limit < count // currentPage < pageCount

  return {
    count,
    items,
    pageInfo: {
      currentPage,
      hasNextPage,
      hasPreviousPage,
      itemCount: count,
      pageCount,
      perPage: limit,
    },
  }
}

module.exports = {
  findById: withPageDependencies(findById),
  findByIds: withPageDependencies(findByIds),
  findByIdsAndType: withPageDependencies(findByIdsAndType),
  findMany: withPageDependencies(findMany),
  findOne: withPageDependencies(findOne),
  link,
  paginate: withPageDependencies(paginate),
}
