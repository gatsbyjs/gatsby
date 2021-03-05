const EXISTING_METHOD = `navigateTo`
const METHOD = `navigate`
const EXISTING_MODULE_NAME = `gatsby-link`
const MODULE_NAME = `gatsby`

const getFirstNode = (j, root) => {
  const first = root.find(j.Program).get(`body`, 0)
  return [first, first.node]
}

const replaceEsm = (j, root) => {
  const importStatement = root.find(j.ImportDeclaration, {
    source: {
      value: EXISTING_MODULE_NAME,
    },
  })

  const containsNavigateTo =
    importStatement.find(j.Identifier, {
      name: EXISTING_METHOD,
    }).length > 0

  if (!importStatement.length || !containsNavigateTo) {
    return
  }

  addGatsbyImport(j, root)
  replaceGatsbyLinkImport(j, root, importStatement)
  replaceCallExpressions(j, root)
}

const replaceCommonJs = (j, root) => {
  const requires = root.find(j.VariableDeclarator, {
    init: {
      callee: { name: `require` },
    },
  })

  const gatsbyLink = requires.find(j.CallExpression, {
    arguments: [{ value: EXISTING_MODULE_NAME }],
  })

  const navigateTo = requires.find(j.Identifier, {
    name: EXISTING_METHOD,
  })

  if (!gatsbyLink.length || !navigateTo.length) {
    return
  }

  addGatsbyRequire(j, root, requires)
  replaceGatsbyLinkRequire(j, root, requires)
  replaceCallExpressions(j, root)
}

const addGatsbyImport = (j, root) => {
  const gatsbyImport = root.find(j.ImportDeclaration, {
    source: {
      value: MODULE_NAME,
    },
  })

  if (!gatsbyImport.length) {
    const [first] = getFirstNode(j, root)
    const statement = j.importDeclaration(
      [j.importSpecifier(j.identifier(METHOD))],
      j.literal(MODULE_NAME)
    )
    first.insertAfter(statement)
    return
  }

  gatsbyImport.replaceWith(({ node }) => {
    node.specifiers = node.specifiers.concat(
      j.importSpecifier(j.identifier(METHOD))
    )
    return node
  })
}

// TODO: make work with existing gatsby requires (e.g. `const { StaticQuery } = require('gatsby');`)
const addGatsbyRequire = (j, root, requires) => {
  const gatsbyRequire = requires.find(j.CallExpression, {
    arguments: [{ value: MODULE_NAME }],
  })

  if (!gatsbyRequire.length) {
    const [first] = getFirstNode(j, root)
    const statement = j.template.statement([
      `const { ${METHOD} } = require('${MODULE_NAME}');\n`,
    ])
    first.insertAfter(statement)
    return
  }
}

const replaceGatsbyLinkImport = (j, root, importStatement) => {
  const imports = importStatement.find(j.Identifier)

  const allExistingMethods = imports.every(
    node => node.value.name === EXISTING_METHOD
  )

  if (allExistingMethods) {
    importStatement.remove()
  }
}

const replaceGatsbyLinkRequire = (j, root, requires) => {
  const links = requires.filter(
    el =>
      j(el).find(j.CallExpression, {
        arguments: [{ value: EXISTING_MODULE_NAME }],
      }).length > 0
  )

  links.forEach(el => {
    const node = j(el)

    node.remove()
  })
}

const replaceCallExpressions = (j, root) => {
  const expressions = root.find(j.CallExpression, {
    callee: { name: EXISTING_METHOD },
  })

  if (!expressions.length) {
    return
  }

  expressions.replaceWith(({ node }) => {
    node.callee.name = METHOD
    return node
  })
}

module.exports = (file, api, options) => {
  const j = api.jscodeshift
  const root = j(file.source)

  const isEsm = root.find(j.ImportDeclaration).length > 0

  if (isEsm) {
    replaceEsm(j, root)
  } else {
    replaceCommonJs(j, root)
  }

  return root.toSource({ quote: `single`, lineTerminator: `\n` })
}
