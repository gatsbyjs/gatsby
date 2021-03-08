const MODULE_NAME = `gatsby`
const IMPORT_NAME = `Link`

function findGatsbyRequire(root, j) {
  const requires = root.find(j.VariableDeclarator, {
    init: {
      callee: { name: `require` },
    },
  })

  const string = requires.find(j.VariableDeclarator, {
    init: { arguments: [{ value: MODULE_NAME }] },
  })

  if (string.length) return string
  // require(`gatsby`)
  return requires.filter(path => {
    const template = path.get(`init`, `arguments`, 0, `quasis`, 0).node
    return !!template && template.value.raw === MODULE_NAME
  })
}

function getFirstNode(j, root) {
  return root.find(j.Program).get(`body`, 0).node
}

function addEsmImport(j, root) {
  const existingImport = root.find(j.ImportDeclaration, {
    source: { value: `gatsby` },
  })

  if (
    existingImport.find(j.ImportSpecifier, { imported: { name: IMPORT_NAME } })
      .length
  )
    return // already exists

  if (!existingImport.length) {
    // save comment at top (if any) and attach it to the new import statement
    const firstNode = getFirstNode(j, root)
    const { comments } = firstNode

    root
      .find(j.Program)
      .get(`body`, 0)
      .insertBefore(
        j.importDeclaration(
          [j.importSpecifier(j.identifier(IMPORT_NAME))],
          j.literal(MODULE_NAME)
        )
      )

    const newFirstNode = getFirstNode(j, root)
    if (newFirstNode !== firstNode) {
      newFirstNode.comments = comments
    }
    return
  }

  const namespace = existingImport.find(j.ImportNamespaceSpecifier)

  if (namespace.length) {
    const { name } = namespace.get(0).node.local
    root
      .find(j.JSXIdentifier, { name: IMPORT_NAME })
      .replaceWith(({ node }) => {
        node.name = `${name}.${IMPORT_NAME}`
        return node
      })
    return
  }
  const { specifiers } = existingImport.get(0).node
  existingImport
    .get(`specifiers`, specifiers.length - 1)
    .insertAfter(j.importSpecifier(j.identifier(IMPORT_NAME)))
}

function removeGatsbyLinkEsmImport(j, root) {
  root.find(j.ImportDeclaration).forEach(path => {
    if (path.value.source.value === `gatsby-link`) {
      if (path.value.specifiers.length === 1) {
        j(path).remove()
      } else {
        path.value.specifiers = path.value.specifiers.filter(
          specifier => specifier.local.name !== IMPORT_NAME
        )
      }
    }
  })
}

function removeGatsbyLinkRequire(j, root) {
  root
    .find(j.VariableDeclarator, {
      init: {
        callee: { name: `require` },
      },
    })
    .forEach(path => {
      let template = path.get(`init`, `arguments`, 0, `value`)
      if (template.value === `gatsby-link`) {
        j(path).remove()
        return
      }

      template = path.get(`init`, `arguments`, 0, `quasis`, 0).node
      if (template.value.raw === `gatsby-link`) {
        j(path).remove()
      }
    })
}

function addRequire(j, root) {
  const existingImport = findGatsbyRequire(root, j)

  if (existingImport.find(j.Identifier, { value: IMPORT_NAME }).length) return // already exists

  if (!existingImport.length) {
    root
      .find(j.Program)
      .get(`body`, 0)
      .insertBefore(
        j.template.statement([
          `const { ${IMPORT_NAME} } = require('${MODULE_NAME}');\n`,
        ])
      )
    return
  }

  const pattern = existingImport.find(j.ObjectPattern)

  if (!pattern.length) {
    const { name } = existingImport.get(`id`).node
    root
      .find(j.JSXIdentifier, { name: IMPORT_NAME })
      .replaceWith(({ node }) => {
        node.name = `${name}.${IMPORT_NAME}`
        return node
      })
    return
  }
  const { properties } = pattern.get(0).node
  const property = j.objectProperty(
    j.identifier(IMPORT_NAME),
    j.identifier(IMPORT_NAME)
  )
  property.shorthand = true
  pattern.get(`properties`, properties.length - 1).insertAfter(property)
}

module.exports = (file, api, options) => {
  const j = api.jscodeshift
  const root = j(file.source)

  const links = root.find(j.Identifier, {
    name: IMPORT_NAME,
  })

  if (!links.length) return false

  const useImportSyntax =
    root.find(j.ImportDeclaration, { importKind: `value` }).length > 0

  if (useImportSyntax) {
    addEsmImport(j, root)
    removeGatsbyLinkEsmImport(j, root)
  } else {
    addRequire(j, root)
    removeGatsbyLinkRequire(j, root)
  }

  return root.toSource({ lineTerminator: `\n` })
}
