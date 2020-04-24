// Move this to gatsby-core-utils?

const { babelParseToAst } = require(`gatsby/dist/utils/babel-parse-to-ast`)
const { createContentDigest } = require(`gatsby-core-utils`)
const { derivePath } = require(`./utils/derive-path`)
const fs = require(`fs-extra`)
const traverse = require(`@babel/traverse`).default
const generate = require(`@babel/generator`).default
const t = require(`@babel/types`)
const systemPath = require(`path`)

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
  const ast = babelParseToAst(
    fs.readFileSync(absolutePath).toString(),
    absolutePath
  )

  let queryString

  // -- Use the ast to find the component and query, and change the code
  // -- to export default the component, instead of our fancy api
  traverse(ast, {
    // TODO: Throw an error if this is not the export default ? just to encourage default habits
    CallExpression(path) {
      if (!isCreatePagesFromData(path)) return
      if (!t.isCallExpression(path)) return // this might not be needed...

      const [componentAst, queryAst] = path.node.arguments

      // 3 options for queryAst also
      queryString = queryAst.quasi.quasis[0].value.raw

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
  })

  const [root, route] = absolutePath.split(`src/pages`)
  const id = createContentDigest(route)
  const collectionCoponentsFolder = systemPath.join(
    root,
    `.cache/collection-components`
  )
  const tempPath = systemPath.join(collectionCoponentsFolder, `${id}.js`)

  // -- create the dir if it doesnt exist
  if (fs.existsSync(collectionCoponentsFolder) === false) {
    fs.mkdirSync(collectionCoponentsFolder)
  }

  // -- write the compiled component to a cache file
  fs.writeFileSync(tempPath, generate(ast).code)

  // -- Get the data, and create a page for each node
  // Not sure this is enough. Seems really brittle way of getting the array out of the query
  const { data } = await graphql(queryString)
  const nodes = Object.values(data)[0].nodes
  nodes.forEach(node => {
    actions.createPage({
      path: derivePath(absolutePath, node),
      component: tempPath,
      context: node,
    })
  })
}
