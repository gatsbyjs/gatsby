const { getById } = require(`../db`)
const { query } = require(`../query`)
const getNodesForQuery = require(`./get-nodes-for-query`)
const withPageDependencies = require(`./page-dependencies`)
const withSpecialCases = require(`./special-cases`)

const findById = () => ({ args }) => getById(args.id)

const findByIds = () => ({ args }) =>
  Array.isArray(args.ids) ? args.ids.map(getById).filter(Boolean) : []

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
  // Don't create page dependencies in getNodesForQuery
  /* eslint-disable-next-line no-unused-vars */
  const { path, ...context } = rp.context || {}
  return query(
    await getNodesForQuery(type, queryArgs.filter, context),
    queryArgs,
    firstResultOnly
  )
}

const findMany = type => async rp => (await find(type)(rp, false)).items

const findOne = type => rp => {
  // FIXME: filter args should be on a `filter` field
  rp.args = { filter: { ...rp.args } }
  return find(type)(rp, true)
}

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

  // FIXME: Should `count` be the number of all query results (before skip/limit),
  // or `items.length`?
  return {
    count: items.length,
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
  paginate: withPageDependencies(paginate),
}
