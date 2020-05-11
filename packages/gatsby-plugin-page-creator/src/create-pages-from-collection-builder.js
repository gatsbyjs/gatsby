// Move this to gatsby-core-utils?

const { createPath } = require(`gatsby-page-utils`)
const { getParams } = require(`./get-params`)
const { babelParseToAst } = require(`gatsby/dist/utils/babel-parse-to-ast`)
const { createContentDigest } = require(`gatsby-core-utils`)
const { derivePath } = require(`./derive-path`)
const { rewriteImports } = require(`./rewrite-imports`)
const fs = require(`fs-extra`)
const traverse = require(`@babel/traverse`).default
const generate = require(`@babel/generator`).default
const t = require(`@babel/types`)
const systemPath = require(`path`)

// Changes something like
//   `/Users/site/src/pages/foo/[id]/`
// to
//   `/foo/:id`
function translateInterpolationToMatchPath(createdPath) {
  const [, path] = createdPath.split(`src/pages`)
  return path.replace(`[`, `:`).replace(`]`, ``).replace(/\/$/, ``)
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
  graphql,
  root,
  queryString
) {
  console.log("createing collection")
  const [, route] = absolutePath.split(`src/pages`)
  const id = createContentDigest(route)
  const collectionCoponentsFolder = systemPath.join(
    root,
    `.cache/collection-components`
  )
  const tempPath = systemPath.join(collectionCoponentsFolder, `${id}.js`)

  const ast = babelParseToAst(
    fs.readFileSync(absolutePath).toString(),
    absolutePath
  )

  // -- Use the ast to find the component and query, and change the code
  // -- to export default the component, instead of our fancy api
  traverse(ast, {
    // TODO: Throw an error if this is not the export default ? just to encourage default habits
    CallExpression(path) {
      if (!isCreatePagesFromData(path)) return
      if (!t.isCallExpression(path)) return // this might not be needed...

      const [componentAst] = path.node.arguments

      // 3 options componentAst's _could be_
      // inline component
      // referenced componenet from within the file
      // imported component from another file

      // Case 1: inline component
      if (t.isIdentifier(componentAst)) {
        const exportDeclaration = path.find(n =>
          t.isExportDefaultDeclaration(n)
        )
        exportDeclaration.node.declaration = componentAst
      }
    },
    Program(path) {
      const imports = path.get(`body`).filter(p => p.isImportDeclaration())

      imports.forEach(importDeclaration =>
        rewriteImports(root, absolutePath, importDeclaration)
      )
    },
  })

  // -- create the dir if it doesnt exist
  if (fs.existsSync(collectionCoponentsFolder) === false) {
    fs.mkdirSync(collectionCoponentsFolder)
  }

  // -- write the compiled component to a cache file
  fs.writeFileSync(tempPath, generate(ast).code)

  // -- Get the data, and create a page for each node
  // Not sure this is enough. Seems really brittle way of getting the array out of the query
  const { data, error } = await graphql(queryString)

  if (!data || error) {
    console.warn(`Tried to create pages from the collection builder found at ${route}.
Unfortunately, the query came back empty. There may be an error in your query.
    `)
    console.error(error)
    return
  }

  console.log({ data, error })

  // tightly dependent on the query being of form:
  // `{ allSomething { nodes { id } } }`
  let nodes = []
  let __otherData = {}

  // This is a hack. We should have something indicate to us which query is the page builder
  Object.entries(data).forEach(([k, v]) => {
    if (Array.isArray(v?.nodes)) {
      nodes = v.nodes
    } else {
      __otherData[k] = v
    }
  })

  if (nodes) {
    console.log(`>>>> Creating ${nodes.length} pages from ${route}`)
  }

  nodes.forEach((node, index) => {
    const matchPath = translateInterpolationToMatchPath(
      createPath(absolutePath)
    )

    const path = derivePath(absolutePath, node)
    const params = getParams(matchPath, path)

    const previous = index === nodes.length - 1 ? null : nodes[index + 1]
    const next = index === 0 ? null : nodes[index - 1]

    console.log("path", path)

    actions.createPage({
      path: path,
      component: tempPath,
      context: {
        __otherData,
        __params: params,
        __collectionData: node,
        // temp added for blog starter to work
        previous,
        next,
      },
    })
  })
}
