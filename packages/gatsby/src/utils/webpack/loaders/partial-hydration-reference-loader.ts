/* eslint-disable @babel/no-invalid-this */
import url from "url"
import { parse } from "acorn-loose"
import { simple as walk } from "acorn-walk"
import type { LoaderDefinitionFunction } from "webpack"
import type { Node } from "acorn-loose"
import type {
  ExportNamedDeclaration,
  ExportDefaultDeclaration,
  AssignmentExpression,
} from "estree"

function createNamedReference(name: string, moduleId: string): string {
  return `export const ${name} = {
    $$typeof: Symbol.for('react.module.reference'),
    filepath: '${moduleId}',
    name: '${name}'
  }`
}

function createDefaultReference(name: string, moduleId: string): string {
  return `export default {
    $$typeof: Symbol.for('react.module.reference'),
    filepath: '${moduleId}',
    name: '${name}'
  }`
}

const partialHydrationReferenceLoader: LoaderDefinitionFunction<
  Record<string, unknown>
> = async function partialHydrationReferenceLoader(content) {
  if (!content.includes(`client export`)) {
    return content
  }

  const references: Array<string> = []

  const moduleId = url
    .pathToFileURL(this.resourcePath)
    .href.replace(this.rootContext.replace(/\\/g, `/`), ``)
    .replace(`file:////`, `file://`)

  walk(parse(content, { ecmaVersion: 2020, sourceType: `module` }), {
    ExportNamedDeclaration(plainAcornNode: Node) {
      // @ts-ignore - Acorn types are bare bones, cast to specific type
      const node = plainAcornNode as unknown as ExportNamedDeclaration

      // Handle cases shown in `fixtures/esm-declaration.js`
      switch (node?.declaration?.type) {
        case `VariableDeclaration`:
          for (const { id } of node.declaration.declarations || []) {
            if (id.type === `Identifier` && id.name) {
              references.push(createNamedReference(id.name, moduleId))
            }

            if (id.type === `ObjectPattern`) {
              // @ts-ignore Wrong type
              for (const { value } of id.properties) {
                if (value.type === `Identifier` && value.name) {
                  references.push(createNamedReference(value.name, moduleId))
                }
              }
            }

            if (id.type === `ArrayPattern`) {
              for (const element of id.elements || []) {
                if (element?.type === `Identifier` && element.name) {
                  references.push(createNamedReference(element.name, moduleId))
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
              createNamedReference(node.declaration.id.name, moduleId)
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
              references.push(createDefaultReference(`default`, moduleId))
            } else {
              references.push(
                createNamedReference(specifier.exported.name, moduleId)
              )
            }
          }
        }
      }
    },
    ExportDefaultDeclaration(plainAcornNode: Node) {
      // @ts-ignore - Acorn types are bare bones, cast to specific type
      const node = plainAcornNode as unknown as ExportDefaultDeclaration

      switch (node.declaration.type) {
        // Handle cases shown in `fixtures/esm-default-expression.js`
        case `Identifier`:
          if (node.declaration.name) {
            references.push(createDefaultReference(`default`, moduleId))
          }
          break
        case `FunctionDeclaration`:
        case `ClassDeclaration`:
          references.push(createDefaultReference(`default`, moduleId))
          break
      }
    },
    // TODO: Explore how to only walk top level tokens
    AssignmentExpression(plainAcornNode) {
      // @ts-ignore - Acorn types are bare bones, cast to specific type
      const node = plainAcornNode as unknown as AssignmentExpression
      const { left } = node

      // Handle cases shown in `fixtures/cjs-exports.js`
      if (
        left?.type === `MemberExpression` &&
        left?.object?.type === `Identifier` &&
        left.object?.name === `exports` &&
        left?.property?.type === `Identifier` &&
        left.property?.name
      ) {
        references.push(createNamedReference(left.property.name, moduleId))
      }
    },
  })

  return references.join(`\n`)
}

module.exports = partialHydrationReferenceLoader
