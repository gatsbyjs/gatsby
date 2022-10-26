import * as graphql from "graphql"

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

function processGraphQLQuery(query: string | graphql.DocumentNode): {
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

export function tranformDocument(ast: graphql.DocumentNode): {
  ast: graphql.DocumentNode
  hasChanged: boolean
  error?: Error
} {
  if (_CFLAGS_.GATSBY_MAJOR === `5`) {
    try {
      return processGraphQLQuery(ast)
    } catch (error) {
      return { ast, hasChanged: false, error }
    }
  }
  return { ast, hasChanged: false }
}
