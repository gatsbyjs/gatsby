/* eslint-disable @babel/no-invalid-this */

import { LoaderDefinitionFunction } from "webpack"
import url from "url"
import { parse } from "acorn"
import { simple as walk } from "acorn-walk"
import type { Node } from "acorn"
import type { ExportNamedDeclaration, AssignmentExpression } from "estree"

function createNewReference(name: string, moduleId: string): string {
  return `export const ${name} = {
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
              references.push(createNewReference(id.name, moduleId))
            }

            if (id.type === `ObjectPattern`) {
              // @ts-ignore Wrong type
              for (const { value } of id.properties) {
                if (value.type === `Identifier` && value.name) {
                  references.push(createNewReference(value.name, moduleId))
                }
              }
            }

            if (id.type === `ArrayPattern`) {
              for (const element of id.elements || []) {
                if (element?.type === `Identifier` && element.name) {
                  references.push(createNewReference(element.name, moduleId))
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
              createNewReference(node.declaration.id.name, moduleId)
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
            // TODO: Confirm how `export { foo as default }` should be handled, depends on how reference import works
            if (specifier.exported.name === `default`) {
              references.push(
                createNewReference(specifier.local.name, moduleId)
              )
            } else {
              references.push(
                createNewReference(specifier.exported.name, moduleId)
              )
            }
          }
        }
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
        references.push(createNewReference(left.property.name, moduleId))
      }
    },
  })

  return references.join(`\n`)
}

module.exports = partialHydrationReferenceLoader
