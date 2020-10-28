import { NodePath, PluginObj } from "@babel/core"
import { Binding } from "@babel/traverse"
import {
  CallExpression,
  Expression,
  Identifier,
  ImportDeclaration,
  ObjectExpression,
  Program,
  StringLiteral,
  TaggedTemplateExpression,
} from "@babel/types"

interface IGraphQLTag {
  isGlobal: boolean
}

const isGlobalIdentifier = (
  tag: NodePath,
  tagName: string = `graphql`
): boolean =>
  tag.isIdentifier({ name: tagName }) && tag.scope.hasGlobal(tagName)

export function followVariableDeclarations(binding: Binding): Binding {
  const node = binding.path?.node
  if (
    node?.type === `VariableDeclarator` &&
    node?.id.type === `Identifier` &&
    node?.init?.type === `Identifier`
  ) {
    return followVariableDeclarations(
      binding.path.scope.getBinding(node.init.name) as Binding
    )
  }
  return binding
}

function getTagImport(tag: NodePath<Identifier>): NodePath | null {
  const name = tag.node.name
  const binding = tag.scope.getBinding(name)

  if (!binding) return null

  const path = binding.path
  const parent = path.parentPath

  if (
    binding.kind === `module` &&
    parent.isImportDeclaration() &&
    parent.node.source.value === `gatsby`
  )
    return path

  if (
    path.isVariableDeclarator() &&
    (path.get(`init`) as NodePath).isCallExpression() &&
    (path.get(`init.callee`) as NodePath).isIdentifier({ name: `require` }) &&
    ((path.get(`init`) as NodePath<CallExpression>).node
      .arguments[0] as StringLiteral).value === `gatsby`
  ) {
    const id = path.get(`id`) as NodePath
    if (id.isObjectPattern()) {
      return id
        .get(`properties`)
        .find(
          path => (path.get(`value`) as NodePath<Identifier>).node.name === name
        ) as NodePath
    }
    return id
  }
  return null
}

function isGraphqlTag(tag: NodePath, tagName: string = `graphql`): boolean {
  const isExpression = tag.isMemberExpression()
  const identifier = isExpression ? tag.get(`object`) : tag

  const importPath = getTagImport(identifier as NodePath<Identifier>)
  if (!importPath) return isGlobalIdentifier(tag, tagName)

  if (
    isExpression &&
    (importPath.isImportNamespaceSpecifier() || importPath.isIdentifier())
  ) {
    return (tag.get(`property`) as NodePath<Identifier>).node.name === tagName
  }

  if (importPath.isImportSpecifier())
    return importPath.node.imported.name === tagName

  if (importPath.isObjectProperty())
    return (importPath.get(`key`) as NodePath<Identifier>).node.name === tagName

  return false
}

function getGraphQLTag(
  path: NodePath<TaggedTemplateExpression>,
  tagName: string = `graphql`
): IGraphQLTag {
  const tag: NodePath = path.get(`tag`) as NodePath
  const isGlobal: boolean = isGlobalIdentifier(tag, tagName)

  if (!isGlobal && !isGraphqlTag(tag, tagName)) return {} as IGraphQLTag

  return {
    isGlobal,
  }
}

function removeImport(tag: NodePath<Expression>): void {
  const isExpression = tag.isMemberExpression()
  const identifier = isExpression ? tag.get(`object`) : tag
  const importPath = getTagImport(identifier as NodePath<Identifier>)

  const removeVariableDeclaration = (statement: NodePath): void => {
    const declaration = statement.findParent((p: NodePath) =>
      p.isVariableDeclaration()
    )
    if (declaration) {
      declaration.remove()
    }
  }

  if (!importPath) return

  const parent = importPath.parentPath

  if (importPath.isImportSpecifier()) {
    if ((parent as NodePath<ImportDeclaration>).node.specifiers.length === 1) {
      parent.remove()
    } else importPath.remove()
  }
  if (importPath.isObjectProperty()) {
    if ((parent as NodePath<ObjectExpression>).node.properties.length === 1) {
      removeVariableDeclaration(importPath)
    } else importPath.remove()
  }
  if (importPath.isIdentifier()) {
    removeVariableDeclaration(importPath)
  }
}

export default function ({ types: t }): PluginObj {
  return {
    visitor: {
      Program(path: NodePath<Program>): void {
        const tagsToRemoveImportsFrom = new Set<NodePath<Expression>>()

        path.traverse({
          TaggedTemplateExpression(path2: NodePath<TaggedTemplateExpression>) {
            const { isGlobal } = getGraphQLTag(path2, `collectionGraphql`)

            const tag = path2.get(`tag`)
            if (!isGlobal) {
              // Enqueue import removal. If we would remove it here, subsequent named exports
              // wouldn't be handled properly
              tagsToRemoveImportsFrom.add(tag)
            }

            // Replace the query with an empty string
            path2.replaceWith(t.StringLiteral(``))
            return null
          },
        })

        tagsToRemoveImportsFrom.forEach(removeImport)
      },
    },
  }
}
