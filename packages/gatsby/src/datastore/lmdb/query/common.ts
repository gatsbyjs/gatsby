import { DbComparator, IDbFilterStatement } from "../../common/query"
import { IGatsbyNode } from "../../../redux/types"
import { getValueAt } from "../../../utils/get-value-at"

export function isDesc(
  sortOrder: "asc" | "desc" | "ASC" | "DESC" | boolean | void
): boolean {
  return sortOrder === `desc` || sortOrder === `DESC` || sortOrder === false
}

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
  nodeOrThunk: IGatsbyNode | (() => IGatsbyNode),
  resolvedNodeFields?: { [field: string]: unknown }
): unknown {
  let result
  if (resolvedNodeFields) {
    result = getValueAt(resolvedNodeFields, dottedFieldPath)
  }
  if (typeof result !== `undefined`) {
    return result
  }
  const node = typeof nodeOrThunk === `function` ? nodeOrThunk() : nodeOrThunk
  return getValueAt(node, dottedFieldPath)
}

export function matchesFilter(
  filter: IDbFilterStatement,
  fieldValue: unknown
): boolean {
  switch (filter.comparator) {
    case DbComparator.EQ:
      return filter.value === null
        ? filter.value == fieldValue
        : filter.value === fieldValue
    case DbComparator.IN: {
      const arr = Array.isArray(filter.value) ? filter.value : [filter.value]
      return arr.some(v => (v === null ? v == fieldValue : v === fieldValue))
    }
    case DbComparator.GT:
      return compareKey(fieldValue, filter.value) > 0
    case DbComparator.GTE:
      return compareKey(fieldValue, filter.value) >= 0
    case DbComparator.LT:
      return compareKey(fieldValue, filter.value) < 0
    case DbComparator.LTE:
      return compareKey(fieldValue, filter.value) <= 0
    case DbComparator.NE:
    case DbComparator.NIN: {
      const arr = Array.isArray(filter.value) ? filter.value : [filter.value]
      return arr.every(v => (v === null ? v != fieldValue : v !== fieldValue))
    }
    case DbComparator.REGEX: {
      if (typeof fieldValue !== `undefined` && filter.value instanceof RegExp) {
        return filter.value.test(String(fieldValue))
      }
      return false
    }
  }
  return false
}

export function cartesianProduct(...arr: Array<Array<any>>): Array<any> {
  return arr.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]])
}

const typeOrder = {
  symbol: 0,
  undefined: 1,
  boolean: 2,
  number: 3,
  string: 4,
}

// Note: this is a copy of this function from lmdb-store:
// https://github.com/DoctorEvidence/lmdb-store/blob/e1e53d6d2012ec22071a8fb7fa3b47f8886b22d2/index.js#L1259-L1300
// We need it here to avoid imports from "lmdb-store" while it is not a direct dependency
// FIXME: replace with an import in v4
export function compareKey(a: unknown, b: unknown): number {
  // compare with type consistency that matches ordered-binary
  if (typeof a == `object`) {
    if (!a) {
      return b == null ? 0 : -1
    }
    if (a[`compare`]) {
      if (b == null) {
        return 1
      } else if (typeof b === `object` && b !== null && b[`compare`]) {
        return a[`compare`](b)
      } else {
        return -1
      }
    }
    let arrayComparison
    if (b instanceof Array) {
      let i = 0
      while (
        (arrayComparison = compareKey(a[i], b[i])) == 0 &&
        i <= a[`length`]
      ) {
        i++
      }
      return arrayComparison
    }
    arrayComparison = compareKey(a[0], b)
    if (arrayComparison == 0 && a[`length`] > 1) return 1
    return arrayComparison
  } else if (typeof a == typeof b) {
    if (typeof a === `symbol` && typeof b === `symbol`) {
      a = Symbol.keyFor(a)
      b = Symbol.keyFor(b)
    }
    return (a as any) < (b as any) ? -1 : a === b ? 0 : 1
  } else if (typeof b == `object`) {
    if (b instanceof Array) return -compareKey(b, a)
    return 1
  } else {
    return typeOrder[typeof a] < typeOrder[typeof b] ? -1 : 1
  }
}
