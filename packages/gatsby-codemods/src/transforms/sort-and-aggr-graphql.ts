import * as graphql from "graphql"
import { parse, print } from "recast"
import {
  transformFromAstSync,
  parseSync,
  ParseResult,
  PluginObj,
} from "@babel/core"

import type { FileInfo } from "jscodeshift"

export default function jsCodeShift(file: FileInfo): string {
  if (
    file.path.includes(`node_modules`) ||
    file.path.includes(`.cache`) ||
    file.path.includes(`public`)
  ) {
    return file.source
  }
  const transformedSource = babelRecast(file.source, file.path)
  return transformedSource
}

export function babelRecast(code: string, filePath: string): string {
  const transformedAst = parse(code, {
    parser: {
      parse: source => runParseSync(source, filePath),
    },
  })

  const changedTracker = { hasChanged: false, filename: filePath } // recast adds extra semicolons that mess with diffs and we want to avoid them

  const options = {
    cloneInputAst: false,
    code: false,
    ast: true,
    plugins: [[updateSortAndAggrField, changedTracker]],
  }

  const result = transformFromAstSync(transformedAst, code, options)
  if (result) {
    const { ast } = result

    if (ast && changedTracker.hasChanged) {
      return print(ast, { lineTerminator: `\n` }).code
    }
  }
  return code
}

function runParseSync(source: string, filePath: string): ParseResult | null {
  const ast = parseSync(source, {
    plugins: [
      `@babel/plugin-syntax-jsx`,
      `@babel/plugin-proposal-class-properties`,
    ],
    overrides: [
      {
        test: [`**/*.ts`, `**/*.tsx`],
        plugins: [[`@babel/plugin-syntax-typescript`, { isTSX: true }]],
      },
    ],
    filename: filePath,
    parserOpts: {
      tokens: true, // recast uses this
    },
  })
  if (!ast) {
    console.log(
      `The codemod was unable to parse ${filePath}. If you're running against the '/src' directory and your project has a custom babel config, try running from the root of the project so the codemod can pick it up.`
    )
  }
  return ast
}

interface IState {
  opts: {
    hasChanged: boolean
  }
}

function isValidGraphQLQuery(query: string): boolean {
  try {
    graphql.parse(query)
    return true
  } catch (e) {
    return false
  }
}

export function updateSortAndAggrField(): PluginObj<IState> {
  return {
    visitor: {
      TaggedTemplateExpression({ node }, state): void {
        if (node.tag.type !== `Identifier`) {
          return
        }
        if (node.tag?.name !== `graphql`) {
          return
        }

        const query = node.quasi?.quasis?.[0]?.value?.raw
        if (query) {
          const { ast: transformedGraphQLQuery, hasChanged } =
            processGraphQLQuery(query)

          if (hasChanged) {
            node.quasi.quasis[0].value.raw = graphql.print(
              transformedGraphQLQuery
            )
            state.opts.hasChanged = true
          }
        }
      },
      TemplateLiteral({ node }, state): void {
        const query = node.quasis?.[0]?.value?.raw
        if (isValidGraphQLQuery(query)) {
          const { ast: transformedGraphQLQuery, hasChanged } =
            processGraphQLQuery(query)

          if (hasChanged) {
            node.quasis[0].value.raw = graphql.print(transformedGraphQLQuery)
            state.opts.hasChanged = true
          }
        }
      },
      CallExpression({ node }, state): void {
        if (node.callee.type !== `Identifier`) {
          return
        }
        if (node.callee.name !== `graphql`) {
          return
        }

        if (node.arguments.length < 1) {
          return
        }

        const argument = node.arguments[0]
        let query: string | undefined = undefined
        if (argument.type === `TemplateLiteral`) {
          query = argument.quasis[0].value.raw
        } else if (argument.type === `StringLiteral`) {
          query = argument.value
        }

        if (query) {
          const { ast: transformedGraphQLQuery, hasChanged } =
            processGraphQLQuery(query)

          if (hasChanged) {
            node.arguments[0] = {
              type: `TemplateLiteral`,
              expressions: [],
              quasis: [
                {
                  type: `TemplateElement`,
                  value: {
                    raw: graphql.print(transformedGraphQLQuery),
                  },
                  tail: true,
                },
              ],
            }
            state.opts.hasChanged = true
          }
        }
      },
    },
  }
}

function extractEnumValues(
  value: graphql.ValueNode,
  acc: Array<string> = []
): undefined | Array<string> {
  let hasValue = false
  if (value.kind === graphql.Kind.ENUM) {
    hasValue = true
    acc.push(value.value)
  } else if (value.kind === graphql.Kind.LIST) {
    // list can be empty but it indicate that it is set at least
    hasValue = true
    for (const listItem of value.values) {
      extractEnumValues(listItem, acc)
    }
  }
  return hasValue ? acc : undefined
}

interface IOldSortObject {
  fields: Array<string>
  order?: Array<"ASC" | "DESC">
}

function isOldSortObject(props: unknown): props is IOldSortObject {
  if (!props || typeof props !== `object` || Array.isArray(props)) {
    return false
  }

  let hasFields = false
  // skip if there any unexpected keys
  for (const [key, value] of Object.entries(props)) {
    if (key === `fields`) {
      if (value) {
        hasFields = true
      }
    } else if (key !== `order`) {
      return false
    }
  }

  return hasFields
}

function pathSegmentsToAst(
  path: string,
  value: string
): graphql.ObjectValueNode | graphql.EnumValueNode {
  return path.split(`___`).reduceRight(
    (previousNode, fieldPathSegment) => {
      return {
        kind: graphql.Kind.OBJECT,
        fields: [
          {
            kind: graphql.Kind.OBJECT_FIELD,
            name: {
              kind: graphql.Kind.NAME,
              value: fieldPathSegment,
            },
            value: previousNode,
          },
        ],
      }
    },
    {
      kind: graphql.Kind.ENUM,
      value,
    } as graphql.ObjectValueNode | graphql.EnumValueNode
  )
}

export function processGraphQLQuery(query: string | graphql.DocumentNode): {
  ast: graphql.DocumentNode
  hasChanged: boolean
} {
  try {
    let hasChanged = false // this is sort of a hack, but print changes formatting and we only want to use it when we have to
    const ast = typeof query === `string` ? graphql.parse(query) : query

    graphql.visit(ast, {
      Argument(node) {
        if (node.name.value === `sort`) {
          if (node.value.kind !== graphql.Kind.OBJECT) {
            return
          }

          // old style sort: `allX(sort: { fields: <something>, order?: </something> })
          const props: Record<string, Array<string> | undefined> = {}
          for (const field of node.value.fields) {
            props[field.name.value] = extractEnumValues(field.value)
          }

          if (!isOldSortObject(props)) {
            return
          }

          // iterate over each pair of field and order and create new object style for each
          const newObjects: Array<
            graphql.ObjectValueNode | graphql.EnumValueNode
          > = []
          for (let i = 0; i < props.fields.length; i++) {
            const field = props.fields[i]
            const order = props.order?.[i] ?? `ASC`

            newObjects.push(pathSegmentsToAst(field, order))
          }

          if (newObjects.length === 0) {
            return
          }

          // @ts-ignore node.value apparently is read-only ...
          node.value =
            newObjects.length > 1
              ? {
                  kind: graphql.Kind.LIST,
                  values: newObjects,
                }
              : newObjects[0]
          hasChanged = true
        } else if (node.name.value === `field`) {
          if (node.value.kind !== graphql.Kind.ENUM) {
            return
          }

          // @ts-ignore read-only ...
          node.value = pathSegmentsToAst(node.value.value, `SELECT`)
          hasChanged = true
        }
      },
    })
    return { ast, hasChanged }
  } catch (err) {
    throw new Error(
      `GatsbySortAndAggrCodemod: GraphQL syntax error in query:\n\n${query}\n\nmessage:\n\n${err}`
    )
  }
}
