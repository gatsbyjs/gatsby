/* eslint-disable @typescript-eslint/no-use-before-define */
import { groupBy } from "lodash"
import {
  IValueDescriptor,
  ValueType,
  ITypeMetadata,
} from "./inference-metadata"
import {
  TypeConflictReporter,
  ITypeConflictExample,
} from "./type-conflict-reporter"

// See gatsby/src/schema/infer/inference-metadata.ts for the ValueDescriptor structs (-> typeInfo)

const getExampleObject = ({
  fieldMap = {},
  typeName,
  typeConflictReporter,
}: ITypeMetadata): { [k: string]: unknown } =>
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

const buildExampleValue = ({
  descriptor,
  typeConflictReporter,
  isArrayItem = false,
  path = ``,
}: {
  descriptor: IValueDescriptor
  typeConflictReporter?: TypeConflictReporter
  path?: string
  isArrayItem?: boolean
}): unknown | null => {
  const [type, conflicts = false] = resolveWinnerType(descriptor)

  if (conflicts && typeConflictReporter) {
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

    case `relatedNode`:
    case `relatedNodeList`: {
      const { nodes = {} } = typeInfo
      return {
        multiple: type === `relatedNodeList`,
        linkedNodes: Object.keys(nodes).filter(key => nodes[key] > 0),
      }
    }

    case `object`: {
      const { dprops } = typeInfo
      let hasKeys = false
      const result = {}
      Object.keys(dprops).forEach(prop => {
        const value = buildExampleValue({
          descriptor: dprops[prop],
          typeConflictReporter,
          path: `${path}.${prop}`,
        })
        if (value !== null) {
          hasKeys = true
          result[prop] = value
        }
      })
      return hasKeys ? result : null
    }

    default:
      return typeInfo.example
  }
}

const resolveWinnerType = (
  descriptor: IValueDescriptor
): [ValueType | "null", boolean?] => {
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

const prepareConflictExamples = (
  descriptor: IValueDescriptor,
  isArrayItem: boolean
): Array<ITypeConflictExample> => {
  const typeNameMapper = (typeName: ValueType): string => {
    if (typeName === `relatedNode`) {
      return `string`
    }
    if (typeName === `relatedNodeList`) {
      return `[string]`
    }
    return [`float`, `int`].includes(typeName) ? `number` : typeName
  }
  const reportedValueMapper = (typeName: ValueType): unknown => {
    if (typeName === `relatedNode`) {
      const { nodes } = descriptor.relatedNode ?? { nodes: {} }
      return Object.keys(nodes).find(key => nodes[key] > 0)
    }
    if (typeName === `relatedNodeList`) {
      const { nodes } = descriptor.relatedNodeList ?? { nodes: {} }
      return Object.keys(nodes).filter(key => nodes[key] > 0)
    }
    if (typeName === `object`) {
      return getExampleObject({
        typeName,
        fieldMap: descriptor!.object!.dprops,
      })
    }
    if (typeName === `array`) {
      const itemValue = buildExampleValue({
        descriptor: descriptor!.array!.item,
        isArrayItem: true,
      })
      return itemValue === null || itemValue === undefined ? [] : [itemValue]
    }
    return descriptor[typeName]?.example
  }
  const conflictingTypes = possibleTypes(descriptor)

  if (isArrayItem) {
    // Differentiate conflict examples by node they were first seen in.
    // See Caveats section in the header of the ./inference-metadata.ts
    const groups = groupBy(
      conflictingTypes,
      type => descriptor[type]?.first || ``
    )
    return Object.keys(groups).map(nodeId => {
      return {
        type: `[${groups[nodeId].map(typeNameMapper).join(`,`)}]`,
        value: groups[nodeId].map(reportedValueMapper),
      }
    })
  }

  return conflictingTypes.map(type => {
    return {
      type: typeNameMapper(type),
      value: reportedValueMapper(type),
    }
  })
}

const isMixedNumber = (descriptor: IValueDescriptor): boolean => {
  const { float, int } = descriptor
  return Boolean(float?.total) && Boolean(int?.total)
}

const isMixOfDateAndString = (descriptor: IValueDescriptor): boolean => {
  const { date, string } = descriptor
  return Boolean(date?.total) && Boolean(string?.total)
}

const hasOnlyEmptyStrings = (descriptor: IValueDescriptor): boolean => {
  const { string } = descriptor
  return string !== undefined && string?.empty === string?.total
}

const possibleTypes = (descriptor: IValueDescriptor = {}): Array<ValueType> =>
  Object.keys(descriptor).filter(type => descriptor[type].total > 0) as Array<
    ValueType
  >

export { getExampleObject }
