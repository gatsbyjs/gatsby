/**
 * Derived types are types that make sense only when their base type exists
 *
 * Take this node for example:
 * {
 *   internal: { type: 'Foo' },
 *   fields: {
 *     bar: "string",
 *   }
 * }
 *
 * It will produce following types:
 * Foo
 * FooFields
 *
 * FooInputFilter
 * FooSortInput
 *
 * FooFieldsInputFilter
 * FooFieldsSortFilter
 * etc
 *
 * Derived types:
 *   Foo: FooFields, FooInputFilter, FooSortInput
 *   FooFields: FooFieldsInputFilter, FooFieldsSortFilter
 *
 * Caveats:
 *   Only types created via inference are marked as derived. So if in the example above
 *   user explicitly defines `FooFields` type (via `createTypes` call) it won't be considered
 *   a derived type
 */
const _ = require(`lodash`)
const { ObjectTypeComposer, InterfaceTypeComposer } = require(`graphql-compose`)

const clearDerivedTypes = ({ schemaComposer, typeComposer }) => {
  const derivedTypes = getDerivedTypes({ typeComposer })

  for (const typeName of derivedTypes.values()) {
    const derivedTypeComposer = schemaComposer.getAnyTC(typeName)
    clearDerivedTypes({ schemaComposer, typeComposer: derivedTypeComposer })
    schemaComposer.delete(typeName)
  }

  if (
    typeComposer instanceof ObjectTypeComposer ||
    typeComposer instanceof InterfaceTypeComposer
  ) {
    typeComposer.removeInputTypeComposer()
  }

  typeComposer.setExtension(`derivedTypes`, new Set())
}

const addDerivedType = ({ typeComposer, derivedTypeName }) => {
  const derivedTypes = getDerivedTypes({ typeComposer })
  typeComposer.setExtension(`derivedTypes`, derivedTypes.add(derivedTypeName))
}

const getDerivedTypes = ({ typeComposer }) =>
  typeComposer.getExtension(`derivedTypes`) || new Set()

// Recursively collects derived type composers for a given typeComposer
// Returns an array of all deeply nested type composers
// (doesn't include root typeComposer passed as an argument)
const collectDerivedTypeComposers = ({ schemaComposer, typeComposer }) => {
  const derivedTypesDeep = collectDerivedTypesRecursive({
    schemaComposer,
    typeComposer,
  })
  return _.uniq(derivedTypesDeep)
    .filter(typeName => typeName !== typeComposer.getTypeName())
    .map(typeName => schemaComposer.getAnyTC(typeName))
}

const collectDerivedTypesRecursive = ({
  schemaComposer,
  typeComposer,
  visited = new Set(),
}) => {
  if (visited.has(typeComposer.getTypeName())) {
    return []
  }
  visited.add(typeComposer.getTypeName())

  const collected = [typeComposer.getTypeName()]
  for (const derivedTypeName of getDerivedTypes({ typeComposer })) {
    if (!schemaComposer.has(derivedTypeName)) {
      continue
    }
    collected.push(derivedTypeName)
    collected.push(
      ...collectDerivedTypesRecursive({
        schemaComposer,
        typeComposer: schemaComposer.getAnyTC(derivedTypeName),
        visited,
      })
    )
  }
  return collected
}

module.exports = {
  clearDerivedTypes,
  addDerivedType,
  getDerivedTypes,
  collectDerivedTypeComposers,
}
