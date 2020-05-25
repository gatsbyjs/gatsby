// Move this to gatsby-core-utils?

const { createPath } = require(`gatsby-page-utils`)
const { getParams } = require(`./get-params`)
const { babelParseToAst } = require(`gatsby/dist/utils/babel-parse-to-ast`)
const { derivePath } = require(`./derive-path`)
const fs = require(`fs-extra`)
const traverse = require(`@babel/traverse`).default
const t = require(`@babel/types`)

// Changes something like
//   `/Users/site/src/pages/foo/[id]/`
// to
//   `/foo/:id`
function translateInterpolationToMatchPath(createdPath) {
  const [, path] = createdPath.split(`src/pages`)
  return path.replace(`[`, `:`).replace(`]`, ``).replace(/\/$/, ``)
}

// Input str could be:
//   Product
//   allProduct
//   allProduct(filter: thing)
// End result should be something like { allProducts { nodes { id }}}
function generateQueryFromString(str, fields) {
  const needsAllPrefix = str.startsWith(`all`) === false

  return `{${needsAllPrefix ? `all` : ``}${str}{nodes{${fields}}}}`
}

// Changes something like
//   `/Users/site/src/pages/foo/[id]/[baz]`
// to
//   `id,baz`
function extractUrlParamsForQuery(createdPath) {
  const parts = /(\[[a-zA-Z_]+\])/.exec(createdPath)

  return parts.map(p => p.replace(`[`, ``).replace(`]`, ``)).join(`,`)
}

function isCreatePagesFromData(path) {
  return (
    (path.node.callee.type === `MemberExpression` &&
      path.node.callee.property.name === `createPagesFromData` &&
      path.get(`callee`).get(`object`).referencesImport(`gatsby`)) ||
    (path.node.callee.name === `createPagesFromData` &&
      path.get(`callee`).referencesImport(`gatsby`))
  )
}

// TODO: Do we need the ignore argument?
exports.createPagesFromCollectionBuilder = async function createPagesFromCollectionBuilder(
  absolutePath,
  actions,
  graphql
) {
  const [, route] = absolutePath.split(`src/pages`)

  const ast = babelParseToAst(
    fs.readFileSync(absolutePath).toString(),
    absolutePath
  )

  let queryString = ``

  traverse(ast, {
    // TODO: Throw an error if this is not the export default ? just to encourage default habits
    CallExpression(path) {
      if (!isCreatePagesFromData(path)) return
      if (!t.isCallExpression(path)) return // this might not be needed...

      const [, queryAst] = path.node.arguments

      queryString = generateQueryFromString(
        queryAst.quasis[0].value.raw,
        extractUrlParamsForQuery(absolutePath)
      )
    },
  })

  console.log({ queryString })

  const { data, error } = await graphql(queryString)

  if (!data || error) {
    console.warn(`Tried to create pages from the collection builder found at ${route}.
Unfortunately, the query came back empty. There may be an error in your query.`)
    console.error(error)
    return
  }

  const rootKey = /^\{([a-zA-Z]+)/.exec(queryString)[1]
  const nodes = data[rootKey].nodes

  if (nodes) {
    console.log(`>>>> Creating ${nodes.length} pages from ${route}`)
  }

  nodes.forEach(node => {
    const matchPath = translateInterpolationToMatchPath(
      createPath(absolutePath)
    )

    const path = derivePath(absolutePath, node)
    const params = getParams(matchPath, path)

    console.log({ node })

    actions.createPage({
      path: path,
      component: absolutePath,
      context: {
        ...node,
        __params: params,
      },
    })
  })
}
