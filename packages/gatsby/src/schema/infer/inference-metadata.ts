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

### Caveats

* Conflict tracking for arrays is tricky, i.e.: { a: [5, "foo"] } and { a: [5] }, { a: ["foo"] }
  are represented identically in metadata. To workaround it we additionally track first NodeId:
  { a: { array: { item: { int: { total: 1, first: `1` }, string: { total: 1, first: `1` } }}
  { a: { array: { item: { int: { total: 1, first: `1` }, string: { total: 1, first: `2` } }}
  This way we can produce more useful conflict reports
  (still rare edge cases possible when reporting may be confusing, i.e. when node is deleted)
*/

import { isEqual } from "lodash";
import { is32BitInteger } from "../../utils/is-32-bit-integer";
import { looksLikeADate } from "../types/date";
import { TypeConflictReporter } from "./type-conflict-reporter";
import type { IGatsbyNode } from "../../internal";

export type ITypeInfo = {
  first?: string | undefined;
  total: number;
  example?: unknown | undefined;
};

export type ITypeInfoString = {
  empty: number;
  example: string;
} & ITypeInfo;

export type ITypeInfoDate = {
  example: string | Date;
} & ITypeInfo;

export type ITypeInfoNumber = {
  example: number;
} & ITypeInfo;

export type ITypeInfoBoolean = {
  example: boolean;
} & ITypeInfo;

export type ITypeInfoArray = {
  item: IValueDescriptor;
} & ITypeInfo;

export type ITypeInfoRelatedNodes = {
  nodes: { [key: string]: number };
} & ITypeInfo;

export type ITypeInfoObject = {
  dprops: {
    [name: string]: IValueDescriptor;
  };
} & ITypeInfo;

export type IValueDescriptor = {
  int?: ITypeInfoNumber | undefined;
  float?: ITypeInfoNumber | undefined;
  date?: ITypeInfoDate | undefined;
  string?: ITypeInfoString | undefined;
  boolean?: ITypeInfoBoolean | undefined;
  array?: ITypeInfoArray | undefined;
  relatedNode?: ITypeInfoRelatedNodes | undefined;
  relatedNodeList?: ITypeInfoRelatedNodes | undefined;
  object?: ITypeInfoObject | undefined;
};

export type ValueType = keyof IValueDescriptor;

export type ITypeMetadata = {
  typeName?: string | undefined;
  disabled?: boolean | undefined;
  ignored?: boolean | undefined;
  dirty?: boolean | undefined;
  total?: number | undefined;
  ignoredFields?: Set<string> | undefined;
  fieldMap?: Record<string, IValueDescriptor> | undefined;
  typeConflictReporter?: TypeConflictReporter | undefined;
  [key: string]: unknown;
};

type Operation = "add" | "del";

function getType(value: unknown, key: string): ValueType | "null" {
  // Staying as close as possible to GraphQL types
  switch (typeof value) {
    case "number":
      return is32BitInteger(value) ? "int" : "float";
    case "string":
      if (key.includes("___NODE")) {
        return "relatedNode";
      }
      return looksLikeADate(value) ? "date" : "string";
    case "boolean":
      return "boolean";
    case "object":
      if (value === null) return "null";
      if (value instanceof Date) return "date";
      if (value instanceof String) return "string";
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return "null";
        }
        return key.includes("___NODE") ? "relatedNodeList" : "array";
      }
      if (!Object.keys(value).length) return "null";
      return "object";
    default:
      // bigint, symbol, function, unknown (host objects in IE were typeof "unknown", for example)
      return "null";
  }
}

function updateValueDescriptorObject(
  value: Record<string, unknown>,
  typeInfo: ITypeInfoObject,
  nodeId: string,
  operation: Operation,
  metadata: ITypeMetadata,
  path: Array<Record<string, unknown>>,
): void {
  path.push(value);

  const { dprops = {} } = typeInfo;
  typeInfo.dprops = dprops;

  Object.keys(value).forEach((key) => {
    const v = value[key];

    let descriptor = dprops[key];
    if (descriptor === undefined) {
      descriptor = {};
      dprops[key] = descriptor;
    }

    updateValueDescriptor(
      nodeId,
      key,
      v,
      operation,
      descriptor,
      metadata,
      path,
    );
  });

  path.pop();
}

function updateValueDescriptorArray(
  value: Array<unknown>,
  key: string,
  typeInfo: ITypeInfoArray,
  nodeId: string,
  operation: Operation,
  metadata: ITypeMetadata,
  path: Array<Record<string, unknown>>,
): void {
  value.forEach((item) => {
    let descriptor = typeInfo.item;
    if (descriptor === undefined) {
      descriptor = {};
      typeInfo.item = descriptor;
    }

    updateValueDescriptor(
      nodeId,
      key,
      item,
      operation,
      descriptor,
      metadata,
      path,
    );
  });
}

const updateValueDescriptorRelNodes = (
  listOfNodeIds: Array<string>,
  delta: number,
  operation: Operation,
  typeInfo: ITypeInfoRelatedNodes,
  metadata: ITypeMetadata,
): void => {
  const { nodes = {} } = typeInfo;
  typeInfo.nodes = nodes;

  listOfNodeIds.forEach((nodeId) => {
    nodes[nodeId] = (nodes[nodeId] || 0) + delta;

    // Treat any new related node addition or removal as a structural change
    // FIXME: this will produce false positives as this node can be
    //  of the same type as another node already in the map (but we don't know it here)
    if (nodes[nodeId] === 0 || (operation === "add" && nodes[nodeId] === 1)) {
      metadata.dirty = true;
    }
  });
};

function updateValueDescriptorString(
  value: string,
  delta: number,
  typeInfo: ITypeInfoString,
): void {
  if (value === "") {
    const { empty = 0 } = typeInfo;
    typeInfo.empty = empty + delta;
  }
  typeInfo.example =
    typeof typeInfo.example !== "undefined" ? typeInfo.example : value;
}

function updateValueDescriptor(
  nodeId: string,
  key: string,
  value: unknown,
  operation: Operation = "add",
  descriptor: IValueDescriptor,
  metadata: ITypeMetadata,
  path: Array<Record<string, unknown>>,
): void {
  // The object may be traversed multiple times from root.
  // Each time it does it should not revisit the same node twice
  if (path.includes(value as Record<string, unknown>)) {
    return;
  }

  const typeName = getType(value, key);

  if (typeName === "null") {
    return;
  }

  const delta = operation === "del" ? -1 : 1;

  let typeInfo: ITypeInfo | undefined = descriptor[typeName];
  if (typeInfo === undefined) {
    // eslint-disable-next-line no-undef
    typeInfo = (descriptor[typeName] as ITypeInfo) = { total: 0 };
  }
  typeInfo.total += delta;

  // Keeping track of structural changes
  // (when value of a new type is added or an existing type has no more values assigned)
  if (typeInfo.total === 0 || (operation === "add" && typeInfo.total === 1)) {
    metadata.dirty = true;
  }

  // Keeping track of the first node for this type. Only used for better conflict reporting.
  // (see Caveats section in the header comments)
  if (operation === "add") {
    if (!typeInfo.first) {
      typeInfo.first = nodeId;
    }
  } else if (operation === "del") {
    if (typeInfo.first === nodeId || typeInfo.total === 0) {
      typeInfo.first = undefined;
    }
  }

  switch (typeName) {
    case "object":
      updateValueDescriptorObject(
        value as Record<string, unknown>,
        typeInfo as ITypeInfoObject,
        nodeId,
        operation,
        metadata,
        path,
      );
      return;
    case "array":
      updateValueDescriptorArray(
        value as Array<unknown>,
        key,
        typeInfo as ITypeInfoArray,
        nodeId,
        operation,
        metadata,
        path,
      );
      return;
    case "relatedNode":
      updateValueDescriptorRelNodes(
        [value as string],
        delta,
        operation,
        typeInfo as ITypeInfoRelatedNodes,
        metadata,
      );
      return;
    case "relatedNodeList":
      updateValueDescriptorRelNodes(
        value as Array<string>,
        delta,
        operation,
        typeInfo as ITypeInfoRelatedNodes,
        metadata,
      );
      return;
    case "string":
      updateValueDescriptorString(
        value as string,
        delta,
        typeInfo as ITypeInfoString,
      );
      return;
  }

  // int, float, boolean, null
  typeInfo.example =
    typeof typeInfo.example !== "undefined" ? typeInfo.example : value;
}

function mergeObjectKeys(
  dpropsKeysA: Record<string, unknown> = {},
  dpropsKeysB: Record<string, unknown> = {},
): Array<string> {
  const dprops = Object.keys(dpropsKeysA);
  const otherProps = Object.keys(dpropsKeysB);
  return [...new Set(dprops.concat(otherProps))];
}

function descriptorsAreEqual(
  descriptor?: IValueDescriptor,
  otherDescriptor?: IValueDescriptor,
): boolean {
  const types = possibleTypes(descriptor);
  const otherTypes = possibleTypes(otherDescriptor);

  const childDescriptorsAreEqual = (type: string): boolean => {
    switch (type) {
      case "array":
        return descriptorsAreEqual(
          descriptor?.array?.item,
          otherDescriptor?.array?.item,
        );
      case "object": {
        const dpropsKeys = mergeObjectKeys(
          descriptor?.object?.dprops,
          otherDescriptor?.object?.dprops,
        );
        return dpropsKeys.every((prop) =>
          descriptorsAreEqual(
            descriptor?.object?.dprops[prop],
            otherDescriptor?.object?.dprops[prop],
          ),
        );
      }
      case "relatedNode": {
        const nodeIds = mergeObjectKeys(
          descriptor?.relatedNode?.nodes,
          otherDescriptor?.relatedNode?.nodes,
        );
        // Must be present in both descriptors or absent in both
        // in order to be considered equal
        return nodeIds.every(
          (id) =>
            Boolean(descriptor?.relatedNode?.nodes[id]) ===
            Boolean(otherDescriptor?.relatedNode?.nodes[id]),
        );
      }
      case "relatedNodeList": {
        const nodeIds = mergeObjectKeys(
          descriptor?.relatedNodeList?.nodes,
          otherDescriptor?.relatedNodeList?.nodes,
        );
        return nodeIds.every(
          (id) =>
            Boolean(descriptor?.relatedNodeList?.nodes[id]) ===
            Boolean(otherDescriptor?.relatedNodeList?.nodes[id]),
        );
      }
      default:
        return true;
    }
  };

  // Equal when all possible types are equal (including conflicts)
  return isEqual(types, otherTypes) && types.every(childDescriptorsAreEqual);
}

function nodeFields(
  node: IGatsbyNode,
  ignoredFields = new Set(),
): Array<string> {
  return Object.keys(node).filter((key) => !ignoredFields.has(key));
}

function updateTypeMetadata(
  metadata = initialMetadata(),
  operation: Operation,
  node: IGatsbyNode,
): ITypeMetadata {
  if (metadata.disabled) {
    return metadata;
  }
  metadata.total = (metadata.total || 0) + (operation === "add" ? 1 : -1);
  if (metadata.ignored) {
    return metadata;
  }
  const { ignoredFields, fieldMap = {} } = metadata;

  nodeFields(node, ignoredFields).forEach((field) => {
    let descriptor = fieldMap[field];
    if (descriptor === undefined) {
      descriptor = {};
      fieldMap[field] = descriptor;
    }

    updateValueDescriptor(
      node.id,
      field,
      node[field],
      operation,
      descriptor,
      metadata,
      [],
    );
  });
  metadata.fieldMap = fieldMap;
  return metadata;
}

export function ignore(
  metadata = initialMetadata(),
  set = true,
): ITypeMetadata {
  metadata.ignored = set;
  metadata.fieldMap = {};
  return metadata;
}

export function disable(
  metadata = initialMetadata(),
  set = true,
): ITypeMetadata {
  metadata.disabled = set;
  return metadata;
}

export function addNode(
  metadata: ITypeMetadata,
  node: IGatsbyNode,
): ITypeMetadata {
  return updateTypeMetadata(metadata, "add", node);
}

export function deleteNode(
  metadata: ITypeMetadata,
  node: IGatsbyNode,
): ITypeMetadata {
  return updateTypeMetadata(metadata, "del", node);
}

export function addNodes(
  metadata = initialMetadata(),
  nodes: Array<IGatsbyNode>,
): ITypeMetadata {
  let state = metadata;
  for (const node of nodes) {
    state = addNode(state, node);
  }
  return state;
}

function possibleTypes(descriptor: IValueDescriptor = {}): Array<ValueType> {
  return Object.keys(descriptor).filter(
    (type) => descriptor[type].total > 0,
  ) as Array<ValueType>;
}

export function isEmpty({ fieldMap }): boolean {
  return Object.keys(fieldMap).every(
    (field) => possibleTypes(fieldMap[field]).length === 0,
  );
}

// Even empty type may still have nodes
export function hasNodes(typeMetadata: ITypeMetadata): boolean {
  return (typeMetadata.total ?? 0) > 0;
}

export function haveEqualFields(
  { fieldMap = {} } = {},
  { fieldMap: otherFieldMap = {} } = {},
): boolean {
  const fields = mergeObjectKeys(fieldMap, otherFieldMap);
  return fields.every((field) =>
    descriptorsAreEqual(fieldMap[field], otherFieldMap[field]),
  );
}

export function initialMetadata(
  state?: Record<string, unknown> | undefined,
): ITypeMetadata {
  return {
    typeName: undefined,
    disabled: false,
    ignored: false,
    dirty: false,
    total: 0,
    ignoredFields: undefined,
    fieldMap: {},
    ...state,
  };
}
