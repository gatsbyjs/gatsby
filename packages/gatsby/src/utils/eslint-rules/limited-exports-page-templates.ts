import { Rule } from "eslint"
import {
  Node,
  Identifier,
  ImportDeclaration,
  TaggedTemplateExpression,
  VariableDeclaration,
  CallExpression,
  Literal,
  TemplateLiteral,
  VariableDeclarator,
  ObjectPattern,
  AssignmentProperty,
  ExportNamedDeclaration,
} from "estree"
import { store } from "../../redux"
import { isPageTemplate } from "../eslint-rules-helpers"

const DEFAULT_GRAPHQL_TAG_NAME = `graphql`

function isApiExport(node: ExportNamedDeclaration, name: string): boolean {
  // check for
  // export function name() {}
  // export async function name() {}
  if (
    node.declaration?.type === `FunctionDeclaration` &&
    node.declaration.id?.name === name
  ) {
    return true
  }

  // check for
  // export const name = () => {}
  if (node.declaration?.type === `VariableDeclaration`) {
    for (const declaration of node.declaration.declarations) {
      if (
        declaration.type === `VariableDeclarator` &&
        declaration.id.type === `Identifier` &&
        declaration.id.name === name
      ) {
        return true
      }
    }
  }

  if (name === `Head`) {
    // Head can be re-exported, Head can be class components - so the checks above are not sufficient,
    // we need to be more permisive here

    // class component
    if (
      node.declaration?.type === `ClassDeclaration` &&
      node.declaration?.id?.type === `Identifier` &&
      node.declaration?.id?.name === name
    ) {
      return true
    }

    // re-exports
    if (
      node.source &&
      node.specifiers.some(specifier => specifier.exported.name === name)
    ) {
      return true
    }
  }

  return false
}

function hasOneValidNamedDeclaration(
  node: Node,
  varName: string | undefined
): boolean {
  // Checks for:
  // const query = graphql``
  // export { query }
  if (node.type === `ExportNamedDeclaration` && node.declaration === null) {
    // For export { foobar, query } the declaration will be null and specifiers exists
    // For { foobar, query } it'll return true, for { query } it'll return false
    // It will ignore any { default } declarations since these are allowed
    const nonQueryExports = node.specifiers.some(e =>
      varName
        ? e.exported.name !== varName && e.exported.name !== `default`
        : e.exported.name !== `default`
    )
    return !nonQueryExports
  }

  return false
}

function isTemplateQuery(
  node: Node,
  graphqlTagName: string,
  namespaceSpecifierName: string
): boolean {
  // For export const query = 'foobar' the declaration exists with type 'VariableDeclaration'

  // Checks for:
  // export const query = graphql``
  // This case only has one item in the declarations array
  // For export const hello = 10, world = 'foo'
  // The array will have two items. So use every() to check if only one item exists
  // With TaggedTemplateExpression and "graphql" name

  // In addition the declaration can also be a MemberExpression like
  // Gatsby.graphql`` when the import happened with import * as Gatsby from "gatsby"

  return (
    node.type === `ExportNamedDeclaration` &&
    node.declaration?.type === `VariableDeclaration` &&
    node.declaration?.declarations.every(el => {
      if (
        el?.init?.type === `TaggedTemplateExpression` &&
        el.init.tag.type === `Identifier`
      ) {
        return el.init.tag.name === graphqlTagName
      } else if (
        el?.init?.type === `TaggedTemplateExpression` &&
        el.init.tag.type === `MemberExpression`
      ) {
        return (
          (el.init.tag.object as Identifier).name === namespaceSpecifierName &&
          (el.init.tag.property as Identifier).name === DEFAULT_GRAPHQL_TAG_NAME
        )
      }
      return false
    })
  )
}

const limitedExports: Rule.RuleModule = {
  meta: {
    type: `problem`,
    messages: {
      limitedExportsPageTemplates: `In page templates only a default export of a valid React component and the named exports of a page query, getServerData, Head or config are allowed.
        All other named exports will cause Fast Refresh to not preserve local component state and do a full refresh.

        Please move your other named exports to another file. Also make sure that you only export page queries that use the "graphql" tag from "gatsby".
`,
    },
  },
  create: context => {
    if (!isPageTemplate(store, context)) {
      return {}
    }

    let queryVariableName: string | undefined = ``
    let graphqlTagName = ``
    let namespaceSpecifierName = ``

    return {
      // const { graphql } = require('gatsby')
      VariableDeclaration: (node): void => {
        // Check if require('gatsby')
        const requiredFromGatsby = (
          node as VariableDeclaration
        ).declarations.find(el => {
          // Handle require(`gatsby`)
          if (
            (el.init as CallExpression)?.arguments?.[0]?.type ===
            `TemplateLiteral`
          ) {
            return (
              ((el.init as CallExpression).arguments[0] as TemplateLiteral)
                ?.quasis[0].value.raw === `gatsby`
            )
          }

          return (
            ((el.init as CallExpression)?.arguments?.[0] as Literal)?.value ===
            `gatsby`
          )
        })

        if (requiredFromGatsby) {
          // Search for "graphql" in a const { graphql, Link } = require('gatsby')
          const graphqlTagSpecifier = (
            (requiredFromGatsby as VariableDeclarator).id as ObjectPattern
          )?.properties.find(
            el =>
              ((el as AssignmentProperty).key as Identifier).name ===
              DEFAULT_GRAPHQL_TAG_NAME
          )

          if (graphqlTagSpecifier) {
            graphqlTagName = (
              (graphqlTagSpecifier as AssignmentProperty).value as Identifier
            ).name
          }
        }

        return undefined
      },
      // import { graphql } from "gatsby"
      ImportDeclaration: (node): void => {
        // Make sure that the specifier is imported from "gatsby"
        if ((node as ImportDeclaration).source.value === `gatsby`) {
          const graphqlTagSpecifier = (
            node as ImportDeclaration
          ).specifiers.find(el => {
            // We only want import { graphql } from "gatsby"
            // Not import graphql from "gatsby"
            if (el.type === `ImportSpecifier`) {
              // Only get the specifier with the original name of "graphql"
              return el.imported.name === DEFAULT_GRAPHQL_TAG_NAME
            }
            // import * as Gatsby from "gatsby"
            if (el.type === `ImportNamespaceSpecifier`) {
              namespaceSpecifierName = el.local.name
              return false
            }
            return false
          })
          if (graphqlTagSpecifier) {
            // The local.name handles the case for import { graphql as otherName }
            // For normal import { graphql } the imported & local name are the same
            graphqlTagName = graphqlTagSpecifier.local.name
          }
        }
        return undefined
      },
      TaggedTemplateExpression: (node): void => {
        if (
          (node as TaggedTemplateExpression).type ===
            `TaggedTemplateExpression` &&
          ((node as TaggedTemplateExpression).tag as Identifier)?.name ===
            graphqlTagName
        ) {
          if (queryVariableName) {
            return undefined
          }
          // @ts-ignore
          queryVariableName = node.parent?.id?.name
        }

        return undefined
      },
      ExportNamedDeclaration: (node): void => {
        if (hasOneValidNamedDeclaration(node, queryVariableName)) {
          return undefined
        }

        if (isTemplateQuery(node, graphqlTagName, namespaceSpecifierName)) {
          return undefined
        }

        if (isApiExport(node, `getServerData`)) {
          return undefined
        }

        if (isApiExport(node, `config`)) {
          return undefined
        }

        if (isApiExport(node, `Head`)) {
          return undefined
        }

        context.report({
          node,
          messageId: `limitedExportsPageTemplates`,
        })

        return undefined
      },
    }
  },
}

module.exports = limitedExports
