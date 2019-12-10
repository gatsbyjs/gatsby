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
  total?: number,
  ignored?: boolean,
  ignoredFields?: Set<string>,
  fieldMap?: { [string]: ValueDescriptor },
  typeName?: string,
  dirty?: boolean, // tracks structural changes only
  disabled?: boolean,
}

type Count = number
type NodeId = string

type ValueDescriptor = {
  int?: TypeInfoNumber,
  float?: TypeInfoNumber,
  date?: TypeInfoDate,
  string?: TypeInfoString,
  boolean?: TypeInfoBoolean,
  array?: TypeInfoArray,
  relatedNode?: TypeInfoRelatedNode,
  relatedNodeList?: TypeInfoRelatedNode,
  object?: TypeInfoObject,
}

abstract type TypeInfo = {
  first?: NodeId | void, // Set to undefined if "del"
  total: Count,
}

type TypeInfoString = TypeInfo & {
  empty: Count,
  example: string,
}

type TypeInfoDate = TypeInfo & {
  example: string,
}

type TypeInfoNumber = {
  example: number,
}

type TypeInfoBoolean = {
  example: boolean,
}

// "dprops" is "descriptor props", which makes it easier to search for than "props"
type TypeInfoObject = TypeInfo & {
  dprops?: {[name: "number" | "string" | "boolean" | "null" | "date" | "string" | "array" | "object"]: Descriptor},
}

type TypeInfoArray = TypeInfo & {
  item: ValueDescriptor,
}

type TypeInfoRelatedNode = TypeInfo & {
  nodes: { [NodeId]: Count }
}

```

### Caveats

* Conflict tracking for arrays is tricky, i.e.: { a: [5, "foo"] } and { a: [5] }, { a: ["foo"] }
  are represented identically in metadata. To workaround it we additionally track first NodeId:
  { a: { array: { item: { int: { total: 1, first: `1` }, string: { total: 1, first: `1` } }}
  { a: { array: { item: { int: { total: 1, first: `1` }, string: { total: 1, first: `2` } }}
  This way we can produce more useful conflict reports
  (still rare edge cases possible when reporting may be confusing, i.e. when node is deleted)
*/

const { isEqual } = require(`lodash`)
const is32BitInteger = require(`./is-32-bit-integer`)
const { looksLikeADate } = require(`../types/date`)

const getType = (value, key) => {
  // Staying as close as possible to GraphQL types
  switch (typeof value) {
    case `number`:
      return is32BitInteger(value) ? `int` : `float`
    case `string`:
      if (key.includes(`___NODE`)) {
        return `relatedNode`
      }
      return looksLikeADate(value) ? `date` : `string`
    case `boolean`:
      return `boolean`
    case `object`:
      if (value === null) return `null`
      if (value instanceof Date) return `date`
      if (value instanceof String) return `string`
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return `null`
        }
        return key.includes(`___NODE`) ? `relatedNodeList` : `array`
      }
      if (!Object.keys(value).length) return `null`
      return `object`
    default:
      // bigint, symbol, function, unknown (host objects in IE were typeof "unknown", for example)
      return `null`
  }
}

const updateValueDescriptorObject = (
  value,
  typeInfo,
  nodeId,
  operation,
  metadata,
  path
) => {
  path.push(value)

  const { dprops = {} } = typeInfo
  typeInfo.dprops = dprops

  Object.keys(value).forEach(key => {
    const v = value[key]

    let descriptor = dprops[key]
    if (descriptor === undefined) {
      descriptor = {}
      dprops[key] = descriptor
    }

    updateValueDescriptor(nodeId, key, v, operation, descriptor, metadata, path)
  })

  path.pop()
}

const updateValueDescriptorArray = (
  value,
  key,
  typeInfo,
  nodeId,
  operation,
  metadata,
  path
) => {
  value.forEach(item => {
    let descriptor = typeInfo.item
    if (descriptor === undefined) {
      descriptor = {}
      typeInfo.item = descriptor
    }

    updateValueDescriptor(
      nodeId,
      key,
      item,
      operation,
      descriptor,
      metadata,
      path
    )
  })
}

const updateValueDescriptorRelNodes = (
  listOfNodeIds,
  delta,
  operation,
  typeInfo,
  metadata
) => {
  const { nodes = {} } = typeInfo
  typeInfo.nodes = nodes

  listOfNodeIds.forEach(nodeId => {
    nodes[nodeId] = (nodes[nodeId] || 0) + delta

    // Treat any new related node addition or removal as a structural change
    // FIXME: this will produce false positives as this node can be
    //  of the same type as another node already in the map (but we don't know it here)
    if (nodes[nodeId] === 0 || (operation === `add` && nodes[nodeId] === 1)) {
      metadata.dirty = true
    }
  })
}

const updateValueDescriptorString = (value, delta, typeInfo) => {
  if (value === ``) {
    const { empty = 0 } = typeInfo
    typeInfo.empty = empty + delta
  }
  typeInfo.example =
    typeof typeInfo.example !== `undefined` ? typeInfo.example : value
}

const updateValueDescriptor = (
  nodeId,
  key,
  value,
  operation = `add` /* add | del */,
  descriptor,
  metadata,
  path
) => {
  // The object may be traversed multiple times from root.
  // Each time it does it should not revisit the same node twice
  if (path.includes(value)) {
    return
  }

  const typeName = getType(value, key)

  if (typeName === `null`) {
    return
  }

  const delta = operation === `del` ? -1 : 1
  let typeInfo = descriptor[typeName]
  if (typeInfo === undefined) {
    typeInfo = descriptor[typeName] = { total: 0 }
  }
  typeInfo.total += delta

  // Keeping track of structural changes
  // (when value of a new type is added or an existing type has no more values assigned)
  if (typeInfo.total === 0 || (operation === `add` && typeInfo.total === 1)) {
    metadata.dirty = true
  }

  // Keeping track of the first node for this type. Only used for better conflict reporting.
  // (see Caveats section in the header comments)
  if (operation === `add`) {
    if (!typeInfo.first) {
      typeInfo.first = nodeId
    }
  } else if (operation === `del`) {
    if (typeInfo.first === nodeId || typeInfo.total === 0) {
      typeInfo.first = undefined
    }
  }

  switch (typeName) {
    case `object`:
      updateValueDescriptorObject(
        value,
        typeInfo,
        nodeId,
        operation,
        metadata,
        path
      )
      return
    case `array`:
      updateValueDescriptorArray(
        value,
        key,
        typeInfo,
        nodeId,
        operation,
        metadata,
        path
      )
      return
    case `relatedNode`:
      updateValueDescriptorRelNodes(
        [value],
        delta,
        operation,
        typeInfo,
        metadata
      )
      return
    case `relatedNodeList`:
      updateValueDescriptorRelNodes(value, delta, operation, typeInfo, metadata)
      return
    case `string`:
      updateValueDescriptorString(value, delta, typeInfo)
      return
  }

  // int, float, boolean, null

  typeInfo.example =
    typeof typeInfo.example !== `undefined` ? typeInfo.example : value
}

const mergeObjectKeys = (dpropsKeysA, dpropsKeysB) => {
  const dprops = Object.keys(dpropsKeysA)
  const otherProps = Object.keys(dpropsKeysB)
  return [...new Set(dprops.concat(otherProps))]
}

const descriptorsAreEqual = (descriptor, otherDescriptor) => {
  const types = possibleTypes(descriptor)
  const otherTypes = possibleTypes(otherDescriptor)

  // Empty are equal
  if (types.length === 0 && otherTypes.length === 0) {
    return true
  }
  // Conflicting and non-matching types are not equal
  // TODO: consider descriptors with equal conflicts as equal?
  if (types.length > 1 || otherTypes.length > 1 || types[0] !== otherTypes[0]) {
    return false
  }
  switch (types[0]) {
    case `array`:
      return descriptorsAreEqual(
        descriptor.array.item,
        otherDescriptor.array.item
      )
    case `object`: {
      const dpropsKeys = mergeObjectKeys(
        descriptor.object.dprops,
        otherDescriptor.object.dprops
      )
      return dpropsKeys.every(prop =>
        descriptorsAreEqual(
          descriptor.object.dprops[prop],
          otherDescriptor.object.dprops[prop]
        )
      )
    }
    case `relatedNode`:
    case `relatedNodeList`: {
      return isEqual(descriptor.nodes, otherDescriptor.nodes)
    }
    default:
      return true
  }
}

const nodeFields = (node, ignoredFields = new Set()) =>
  Object.keys(node).filter(key => !ignoredFields.has(key))

const updateTypeMetadata = (metadata = initialMetadata(), operation, node) => {
  if (metadata.disabled) {
    return metadata
  }
  metadata.total = (metadata.total || 0) + (operation === `add` ? 1 : -1)
  if (metadata.ignored) {
    return metadata
  }
  const { ignoredFields, fieldMap = {} } = metadata

  nodeFields(node, ignoredFields).forEach(field => {
    let descriptor = fieldMap[field]
    if (descriptor === undefined) {
      descriptor = {}
      fieldMap[field] = descriptor
    }

    updateValueDescriptor(
      node.id,
      field,
      node[field],
      operation,
      descriptor,
      metadata,
      []
    )
  })
  metadata.fieldMap = fieldMap
  return metadata
}

const ignore = (metadata = initialMetadata(), set = true) => {
  metadata.ignored = set
  metadata.fieldMap = {}
  return metadata
}

const disable = (metadata = initialMetadata(), set = true) => {
  metadata.disabled = set
  return metadata
}

const addNode = (metadata, node) => updateTypeMetadata(metadata, `add`, node)
const deleteNode = (metadata, node) => updateTypeMetadata(metadata, `del`, node)
const addNodes = (metadata = initialMetadata(), nodes) =>
  nodes.reduce(addNode, metadata)

const possibleTypes = (descriptor = {}) =>
  Object.keys(descriptor).filter(type => descriptor[type].total > 0)

const isEmpty = ({ fieldMap }) =>
  Object.keys(fieldMap).every(
    field => possibleTypes(fieldMap[field]).length === 0
  )

// Even empty type may still have nodes
const hasNodes = typeMetadata => typeMetadata.total > 0

const haveEqualFields = (
  { fieldMap = {} } = {},
  { fieldMap: otherFieldMap = {} } = {}
) => {
  const fields = mergeObjectKeys(fieldMap, otherFieldMap)
  return fields.every(field =>
    descriptorsAreEqual(fieldMap[field], otherFieldMap[field])
  )
}

const initialMetadata = state => {
  return {
    typeName: undefined,
    disabled: false,
    ignored: false,
    dirty: false,
    total: 0,
    ignoredFields: undefined,
    fieldMap: {},
    ...state,
  }
}

module.exports = {
  addNode,
  addNodes,
  deleteNode,
  ignore,
  disable,
  isEmpty,
  hasNodes,
  haveEqualFields,
  initialMetadata,
}
