import { compareKey } from "lmdb-store"
import { DbComparator, IDbFilterStatement } from "../../common/query"
import { IGatsbyNode } from "../../../redux/types"
import { getValueAt } from "../../../utils/get-value-at"

/**
 * Given dotted field selector (e.g. `foo.bar`) returns a plain list of values matching this selector.
 * It is possible that the path maps to several values when one of the intermediate values is an array.
 *
 * Example node:
 * {
 *   foo: [{ bar: `bar1`}, { bar: `bar2` }]
 * }
 *
 * In this case resolveFieldValue([`foo`, `bar`], node) returns [`bar1`, `bar2`]
 *
 * When `resolvedNodeFields` argument is passed the function first looks for values in this object
 * and only looks in the node if the value is not found in `resolvedNodeFields`
 */
export function resolveFieldValue(
  dottedFieldPath: string | Array<string>,
  node: IGatsbyNode,
  resolvedNodeFields?: { [field: string]: unknown }
): unknown {
  let result
  if (resolvedNodeFields) {
    result = getValueAt(resolvedNodeFields, dottedFieldPath)
  }
  // Note: if result === null we return null
  return result ?? getValueAt(node, dottedFieldPath)
}

export function shouldFilter(
  filter: IDbFilterStatement,
  fieldValue: unknown
): boolean {
  const value = filter.value
  // FIXME: lmdb-store typing are outdated?
  const compareKeyFn: any = compareKey

  switch (filter.comparator) {
    case DbComparator.EQ:
      return value === null ? value == fieldValue : value === fieldValue
    case DbComparator.IN: {
      const arr = Array.isArray(value) ? value : [value]
      return arr.some(v => (v === null ? v == fieldValue : v === fieldValue))
    }
    case DbComparator.GT:
      return compareKeyFn(value, fieldValue) > 0
    case DbComparator.GTE:
      return compareKeyFn(value, fieldValue) >= 0
    case DbComparator.LT:
      return compareKeyFn(value, fieldValue) < 0
    case DbComparator.LTE:
      return compareKeyFn(value, fieldValue) <= 0
    case DbComparator.NE:
    case DbComparator.NIN: {
      const arr = Array.isArray(value) ? value : [value]
      return arr.every(v => (v === null ? v != fieldValue : v !== fieldValue))
    }
    case DbComparator.REGEX: {
      if (typeof fieldValue !== `undefined` && value instanceof RegExp) {
        return value.test(String(fieldValue))
      }
      return false
    }
  }
  return false
}

export function cartesianProduct(...arr: Array<Array<any>>): Array<any> {
  return arr.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]])
}

export function assertLength(arr: Array<any>, expectedLength: number): void {
  if (arr.length !== expectedLength) {
    throw new Error(`Invariant violation`)
  }
}
