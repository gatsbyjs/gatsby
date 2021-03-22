const MODULE_NAME = `gatsby`
const IMPORT_NAME = `graphql`

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

function addEsmImport(j, root, tag) {
  const existingImport = root.find(j.ImportDeclaration, {
    source: { value: `gatsby` },
  })

  if (
    existingImport.find(j.ImportSpecifier, { imported: { name: `graphql` } })
      .length
  )
    return // already exists

  if (!existingImport.length) {
    const first = root.find(j.Program).get(`body`, 0)
    const comments = first.node.comments.splice(0)
    const importStatement = j.importDeclaration(
      [j.importSpecifier(j.identifier(IMPORT_NAME))],
      j.literal(MODULE_NAME)
    )
    importStatement.comments = comments
    root.find(j.Program).get(`body`, 0).insertBefore(importStatement)
    return
  }

  const namespace = existingImport.find(j.ImportNamespaceSpecifier)

  if (namespace.length) {
    const { name } = namespace.get(0).node.local
    root
      .find(j.TaggedTemplateExpression, { tag: { name: `graphql` } })
      .replaceWith(({ node }) => {
        node.tag = j.memberExpression(
          j.identifier(name),
          j.identifier(IMPORT_NAME)
        )
        return node
      })
    return
  }
  const { specifiers } = existingImport.get(0).node
  existingImport
    .get(`specifiers`, specifiers.length - 1)
    .insertAfter(j.importSpecifier(j.identifier(IMPORT_NAME)))
}

function addRequire(j, root, tag) {
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
      .find(j.TaggedTemplateExpression, { tag: { name: `graphql` } })
      .replaceWith(({ node }) => {
        node.tag = j.memberExpression(
          j.identifier(name),
          j.identifier(IMPORT_NAME)
        )
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

  const tags = root.find(j.TaggedTemplateExpression, {
    tag: { name: `graphql` },
  })

  if (!tags.length) return false

  const tag = tags.get(0)

  const useImportSyntax =
    root.find(j.ImportDeclaration, { importKind: `value` }).length > 0 ||
    root.find(j.VariableDeclarator, {
      init: {
        callee: { name: `require` },
      },
    }).length === 0

  if (useImportSyntax) {
    addEsmImport(j, root, tag)
  } else {
    addRequire(j, root, tag)
  }

  return root.toSource({ quote: `single`, lineTerminator: `\n` })
}
