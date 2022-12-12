/* eslint-disable @babel/no-invalid-this */
import { parse } from "acorn-loose"
import { simple as walk } from "acorn-walk"
import type { LoaderDefinitionFunction } from "webpack"
import type { Node } from "acorn-loose"
import type {
  ExportNamedDeclaration,
  ExportDefaultDeclaration,
  AssignmentExpression,
  Directive,
} from "estree"
import { createNormalizedModuleKey } from "../utils/create-normalized-module-key"

function createNamedReference(
  name: string,
  normalizedModuleKey: string
): string {
  return `export const ${name} = {
    $$typeof: Symbol.for('react.module.reference'),
    filepath: '${normalizedModuleKey}',
    name: '${name}'
  }`
}

function createDefaultReference(
  name: string,
  normalizedModuleKey: string
): string {
  return `export default {
    $$typeof: Symbol.for('react.module.reference'),
    filepath: '${normalizedModuleKey}',
    name: '${name}'
  }`
}

const partialHydrationReferenceLoader: LoaderDefinitionFunction<
  Record<string, unknown>
> = async function partialHydrationReferenceLoader(content) {
  if (!content.includes(`use client`)) {
    return content
  }

  const references: Array<string> = []
  let hasClientExportDirective = false

  const normalizedModuleKey = createNormalizedModuleKey(
    this.resourcePath,
    this.rootContext
  )

  walk(parse(content, { ecmaVersion: 2020, sourceType: `module` }), {
    ExpressionStatement(plainAcornNode: Node) {
      const node = plainAcornNode as unknown as Directive

      if (node.directive === `use client`) {
        hasClientExportDirective = true
      }
    },
    ExportNamedDeclaration(plainAcornNode: Node) {
      const node = plainAcornNode as unknown as ExportNamedDeclaration

      if (!hasClientExportDirective) return

      // Handle cases shown in `fixtures/esm-declaration.js`
      switch (node?.declaration?.type) {
        case `VariableDeclaration`:
          for (const { id } of node.declaration.declarations || []) {
            if (id.type === `Identifier` && id.name) {
              references.push(
                createNamedReference(id.name, normalizedModuleKey)
              )
            }

            if (id.type === `ObjectPattern`) {
              // @ts-ignore Wrong type
              for (const { value } of id.properties) {
                if (value.type === `Identifier` && value.name) {
                  references.push(
                    createNamedReference(value.name, normalizedModuleKey)
                  )
                }
              }
            }

            if (id.type === `ArrayPattern`) {
              for (const element of id.elements || []) {
                if (element?.type === `Identifier` && element.name) {
                  references.push(
                    createNamedReference(element.name, normalizedModuleKey)
                  )
                }
              }
            }
          }
          break
        case `FunctionDeclaration`:
        case `ClassDeclaration`:
          if (
            node.declaration.id?.type === `Identifier` &&
            node.declaration.id.name
          ) {
            references.push(
              createNamedReference(
                node.declaration.id.name,
                normalizedModuleKey
              )
            )
          }
          break
      }

      // Handle cases shown in `fixtures/esm-list.js`
      if (node.specifiers.length) {
        for (const specifier of node.specifiers) {
          if (
            specifier.type === `ExportSpecifier` &&
            specifier.exported.type === `Identifier` &&
            specifier.exported.name
          ) {
            if (specifier.exported.name === `default`) {
              references.push(
                createDefaultReference(`default`, normalizedModuleKey)
              )
            } else {
              references.push(
                createNamedReference(
                  specifier.exported.name,
                  normalizedModuleKey
                )
              )
            }
          }
        }
      }
    },
    ExportDefaultDeclaration(plainAcornNode: Node) {
      const node = plainAcornNode as unknown as ExportDefaultDeclaration

      if (!hasClientExportDirective) return

      switch (node.declaration.type) {
        // Handle cases shown in `fixtures/esm-default-expression.js`
        case `Identifier`:
          if (node.declaration.name) {
            references.push(
              createDefaultReference(`default`, normalizedModuleKey)
            )
          }
          break
        case `FunctionDeclaration`:
        case `ClassDeclaration`:
          references.push(
            createDefaultReference(`default`, normalizedModuleKey)
          )
          break
      }
    },
    // TODO: Explore how to only walk top level tokens
    AssignmentExpression(plainAcornNode) {
      const node = plainAcornNode as unknown as AssignmentExpression
      const { left } = node

      if (!hasClientExportDirective) return

      // Handle cases shown in `fixtures/cjs-exports.js`
      if (
        left?.type === `MemberExpression` &&
        left?.object?.type === `Identifier` &&
        left.object?.name === `exports` &&
        left?.property?.type === `Identifier` &&
        left.property?.name
      ) {
        references.push(
          createNamedReference(left.property.name, normalizedModuleKey)
        )
      }
    },
  })

  return hasClientExportDirective ? references.join(`\n`) : content
}

module.exports = partialHydrationReferenceLoader
