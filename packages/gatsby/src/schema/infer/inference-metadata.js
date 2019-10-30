/*
## Incrementally track the structure of nodes with metadata

This metadata can be later utilized for schema inference
(via building `exampleValue` or directly)

### Usage example:

```javascript
  const node1 = { id: '1', foo: 25, bar: 'str' }
  const node2 = { id: '1', foo: 'conflict' }

  let meta = { ignoredFields: new Set(['id']) }
  meta = addNode(meta, node1)
  meta = addNode(meta, node2)
  console.log(meta.fieldMap)
  // outputs: {
  //   foo: {
  //     int: { total: 1, example: 25 },
  //     string: { total: 1, example: 'conflict' },
  //   },
  //   bar: {
  //     string: { total: 1, example: 'str' },
  //   },
  // }

  const example1 = getExampleObject({ meta, typeName, typeConflictReporter })
  console.log(example1)
  // outputs { bar: 'str' }
  // and reports conflicts discovered

  meta = deleteNode(meta, node2)
  console.log(meta.fieldMap)
  // outputs: {
  //   foo: {
  //     int: { total: 1, example: 25 },
  //     string: { total: 0, example: 'conflict' },
  //   },
  //   bar: { string: { total: 1, example: 'str' } },
  // }

  const example2 = getExampleObject({ meta, typeName, typeConflictReporter })
  // outputs: { foo: 25, bar: 'str' }
```

`addNode`, `deleteNode`, `getExampleObject` are O(N) where N is the number
of fields in the node object (including nested fields)

### Metadata structure

```javascript
type TypeMetadata = {
  ignoredFields?: Set<string>,
  fieldMap?: { [string]: ValueDescriptor },
  typeName?: string,
  dirty?: boolean, // tracks structural changes only
}

type Count = Number
type NodeId = string

type ValueDescriptor = {
  int?: { total: Count, example: number },
  float?: { total: Count, example: number },
  date?: { total: Count, example: string },
  string?: { total: Count, empty: Count, example: string },
  boolean?: { total: Count, example: boolean },
  array?: { total: Count, item: ValueDescriptor },
  union?: { total: Count, nodes: { [NodeId]: Count } },
  object?: { total: 0, props: { [string]: ValueDescriptor } },
}
```
*/

const is32BitInteger = require(`./is-32-bit-integer`)
const { looksLikeADate } = require(`../types/date`)

const getType = (value, key) => {
  // Staying as close as possible to GraphQL types
  switch (typeof value) {
    case `number`:
      return is32BitInteger(value) ? `int` : `float`
    case `string`:
      return looksLikeADate(value) ? `date` : `string`
    case `boolean`:
      return `boolean`
    case `object`:
      if (value === null) return `null`
      if (value instanceof Date) return `date`
      if (value instanceof String) return `string`
      if (Array.isArray(value)) {
        return key.includes(`___NODE`) ? `union` : `array`
      }
      if (!Object.keys(value).length) return `null`
      return `object`
    default:
      return `null`
  }
}

const updateValueDescriptor = ({
  key,
  value,
  operation = `add`,
  descriptor = {},
}) => {
  const typeName = getType(value, key)

  if (typeName === `null`) {
    return [descriptor, false]
  }

  const delta = operation === `del` ? -1 : 1
  const typeInfo = descriptor[typeName] || { total: 0 }
  typeInfo.total += delta

  // Keeping track of structural changes
  // (when value of a new type is added or an existing type has no more values assigned)
  let dirty = typeInfo.total === 1 || typeInfo.total === 0

  switch (typeName) {
    case `object`: {
      const { props = {} } = typeInfo
      Object.keys(value).forEach(key => {
        const [propDescriptor, propDirty] = updateValueDescriptor({
          key,
          value: value[key],
          operation,
          descriptor: props[key],
        })
        props[key] = propDescriptor
        dirty = dirty || propDirty
      })
      typeInfo.props = props
      break
    }
    case `array`: {
      value.forEach(item => {
        const [itemDescriptor, itemDirty] = updateValueDescriptor({
          descriptor: typeInfo.item,
          operation,
          value: item,
          key,
        })
        typeInfo.item = itemDescriptor
        dirty = dirty || itemDirty
      })
      break
    }
    case `union`: {
      const { nodes = {} } = typeInfo
      value.forEach(nodeId => {
        nodes[nodeId] = (nodes[nodeId] || 0) + delta

        // Treat any new related node addition or removal as a structural change
        // FIXME: this will produce false positives as this node can be
        //  of the same type as another node already in the map (but we don't know it)
        dirty = dirty || nodes[nodeId] === 0 || nodes[nodeId] === 1
      })
      typeInfo.nodes = nodes
      break
    }
    case `string`: {
      // FIXME: need this to satisfy pre-refactoring tests
      if (value === ``) {
        const { empty = 0 } = typeInfo
        typeInfo.empty = empty + delta
      }
      typeInfo.example = typeInfo.example || value
      break
    }
    default:
      typeInfo.example = typeInfo.example || value
      break
  }
  descriptor[typeName] = typeInfo
  return [descriptor, dirty]
}

const nodeFields = (node, ignoredFields = new Set()) =>
  Object.keys(node).filter(key => !ignoredFields.has(key))

const updateTypeMetadata = (metadata = {}, operation, node) => {
  const { ignoredFields, fieldMap = {}, dirty = false } = metadata

  let structureChanged = false
  nodeFields(node, ignoredFields).forEach(field => {
    const [descriptor, valueStructureChanged] = updateValueDescriptor({
      key: field,
      value: node[field],
      operation,
      descriptor: fieldMap[field],
    })
    fieldMap[field] = descriptor
    structureChanged = structureChanged || valueStructureChanged
  })
  metadata.fieldMap = fieldMap
  metadata.dirty = dirty || structureChanged
  return metadata
}

const addNode = (metadata, node) => updateTypeMetadata(metadata, `add`, node)
const deleteNode = (metadata, node) => updateTypeMetadata(metadata, `del`, node)
const addNodes = (metadata, nodes) => nodes.reduce(addNode, metadata)

const isMixedNumber = ({ float, int }) =>
  float && float.total > 0 && (int && int.total > 0)

const isMixOfDateAndString = ({ date, string }) =>
  date && date.total > 0 && (string && string.total > 0)

const hasOnlyEmptyStrings = ({ string }) =>
  string && string.empty === string.total

const possibleTypes = descriptor =>
  Object.keys(descriptor).filter(type => descriptor[type].total > 0)

const resolveWinnerType = descriptor => {
  const candidates = possibleTypes(descriptor)
  if (candidates.length === 1) {
    return [candidates[0]]
  }
  if (candidates.length === 2 && isMixedNumber(descriptor)) {
    return [`float`]
  }
  if (candidates.length === 2 && isMixOfDateAndString(descriptor)) {
    return [hasOnlyEmptyStrings(descriptor) ? `date` : `string`]
  }
  if (candidates.length > 1) {
    return [`null`, true]
  }
  return [`null`]
}

const prepareConflictExamples = (descriptor, isArrayItem) => {
  // FIXME: here we convert examples into format of the previous exampleValue
  //  implementation to make tests pass. It might make sense to change tests instead
  const typeNameMapper = typeName => {
    if (typeName === `union`) {
      return `array`
    }
    return [`float`, `int`].includes(typeName) ? `number` : typeName
  }
  const candidates = possibleTypes(descriptor)

  if (isArrayItem) {
    const reportedType = `[${candidates.map(typeNameMapper).join(`,`)}]`
    const reportedValue = candidates.map(type => descriptor[type].example)
    return [{ type: reportedType, value: reportedValue }]
  }

  return candidates.map(type => {
    return {
      type: typeNameMapper(type),
      value: descriptor[type].example,
    }
  })
}

const buildExampleValue = ({
  descriptor,
  typeConflictReporter,
  isArrayItem = false,
  path = ``,
}) => {
  const [type, conflicts = false] = resolveWinnerType(descriptor)

  if (conflicts) {
    typeConflictReporter.addConflict(
      path,
      prepareConflictExamples(descriptor, isArrayItem)
    )
  }

  const typeInfo = descriptor[type]

  switch (type) {
    case `null`:
      return null

    case `date`:
    case `string`: {
      // FIXME: Remove this and fix tests (this was mostly done for compatibility
      //  with the previous exampleValue implementation and to make all tests pass)
      if (isMixOfDateAndString(descriptor)) {
        return hasOnlyEmptyStrings(descriptor) ? `1978-09-26` : `String`
      }
      return typeInfo.example
    }

    case `array`: {
      const { item } = typeInfo
      const exampleItemValue = item
        ? buildExampleValue({
            descriptor: item,
            isArrayItem: true,
            typeConflictReporter,
            path,
          })
        : null
      return exampleItemValue === null ? null : [exampleItemValue]
    }

    case `union`: {
      const { nodes = {} } = typeInfo
      return Object.keys(nodes).filter(key => nodes[key] > 0)
    }

    case `object`: {
      const { props } = typeInfo
      return Object.keys(props).reduce((acc, prop) => {
        const value = buildExampleValue({
          descriptor: props[prop],
          typeConflictReporter,
          path: `${path}.${prop}`,
        })
        if (value !== null) {
          acc[prop] = value
        }
        return acc
      }, {})
    }

    default:
      return typeInfo.example
  }
}

const getExampleObject = ({ fieldMap, typeName, typeConflictReporter }) =>
  Object.keys(fieldMap).reduce((acc, key) => {
    const value = buildExampleValue({
      path: `${typeName}.${key}`,
      descriptor: fieldMap[key],
      typeConflictReporter,
    })
    if (key && value !== null) {
      acc[key] = value
    }
    return acc
  }, {})

module.exports = {
  addNode,
  addNodes,
  deleteNode,
  getExampleObject,
}
