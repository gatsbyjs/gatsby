import {
  createDbQueriesFromObject,
  DbComparator,
  DbQuery,
  dbQueryToDottedField,
} from "../../../common/query"
import {
  getIndexRanges,
  BinaryInfinityPositive,
  BinaryInfinityNegative,
} from "../filter-using-index"

describe(`getIndexRangeQueries`, () => {
  const allFilter = {
    simpleEq: { $eq: 1 },
    simpleIn: { $in: [1, 2] },
    simpleLt: { $lt: 2 },
    simpleLte: { $lte: 3 },
    simpleGt: { $gt: 4 },
    simpleGte: { $gte: 5 },
    gtLte: { $gt: 6, $lte: 10 },
    gtLt: { $gt: 6, $lt: 10 },
    gteLte: { $gte: 6, $lte: 10 },
    gteLt: { $gte: 6, $lt: 10 },
    mixedEqLteGte: { $eq: 1, $lte: 10, $gte: 6 },
    mixedInLteGte: { $in: [1, 2], $lte: 10, $gte: 6 },
  }
  const dbQueries = createDbQueriesFromObject(allFilter)

  describe(`Index on a single field`, () => {
    test(`simple $eq`, () => {
      const indexFields = { simpleEq: 1 }

      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([{ start: [1], end: [[1, null]] }])
    })
    test(`simple $in`, () => {
      const indexFields = { simpleIn: 1 }

      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([
        { start: [1], end: [[1, null]] },
        { start: [2], end: [[2, null]] },
      ])
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)
    })
    test(`simple $lt`, () => {
      const indexFields = { simpleLt: 1 }

      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([
        { start: [BinaryInfinityNegative], end: [2] },
      ])
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)
    })
    test(`simple $lte`, () => {
      const indexFields = { simpleLte: 1 }

      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([
        { start: [BinaryInfinityNegative], end: [[3, null]] },
      ])
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)
    })
    test(`simple $gt`, () => {
      const indexFields = { simpleGt: 1 }

      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([
        { start: [[4, null]], end: [BinaryInfinityPositive] },
      ])
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)
    })
    test(`simple $gte`, () => {
      const indexFields = { simpleGte: 1 }

      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([
        { start: [5], end: [BinaryInfinityPositive] },
      ])
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)
    })
    test(`$gt and $lte`, () => {
      const indexFields = { gtLte: 1 }

      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([{ start: [[6, null]], end: [[10, null]] }])
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)
    })
    test(`$gt and $lt`, () => {
      const indexFields = { gtLt: 1 }

      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([{ start: [[6, null]], end: [10] }])
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)
    })
    test(`$gte and $lte`, () => {
      const indexFields = { gteLte: 1 }

      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([{ start: [6], end: [[10, null]] }])
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)
    })
    test(`$gte and $lt`, () => {
      const indexFields = { gteLt: 1 }

      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([{ start: [6], end: [10] }])
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)
    })

    test(`mixed $eq and $gte with $lt`, () => {
      const indexFields = { mixedEqLteGte: 1 }

      // Note: for now this returns the most specific ranges only ($eq)
      //   assuming $gte and $lt will be filtered in runtime
      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([{ start: [1], end: [[1, null]] }])
      expect(result.usedQueries.size).toEqual(1)
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)

      // Double check that $lte and $gte queries are not set in usedQueries
      const lteGteQueries = dbQueries.filter(
        q =>
          q.type === `query` &&
          q.path[0] === `mixedEqLteGte` &&
          [DbComparator.LTE, DbComparator.GTE].includes(q.query.comparator)
      )
      expect(lteGteQueries.length).toEqual(2)
      expect(result.usedQueries).not.toContain(lteGteQueries[0])
      expect(result.usedQueries).not.toContain(lteGteQueries[1])
    })

    test(`mixed $in and $gte with $lte`, () => {
      const indexFields = { mixedInLteGte: 1 }

      // Note: for now this returns the most specific ranges only ($in)
      //   assuming $gte and $lte will be filtered in runtime
      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([
        { start: [1], end: [[1, null]] },
        { start: [2], end: [[2, null]] },
      ])
      expect(result.usedQueries.size).toEqual(1)
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)

      // Double check that $lte and $gte queries are not set in usedQueries
      const lteGteQueries = dbQueries.filter(
        q =>
          q.type === `query` &&
          q.path[0] === `mixedInLteGte` &&
          [DbComparator.LTE, DbComparator.GTE].includes(q.query.comparator)
      )
      expect(lteGteQueries.length).toEqual(2)
      expect(result.usedQueries).not.toContain(lteGteQueries[0])
      expect(result.usedQueries).not.toContain(lteGteQueries[1])
    })
  })

  describe(`Index on two fields`, () => {
    test(`field1: simple $eq; field2: simple $in`, () => {
      const indexFields = { simpleEq: 1, simpleIn: 1 }

      // Note: for now this returns the most specific ranges only ($in)
      //   assuming $gte and $lt will be filter out in runtime
      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual([
        {
          start: [1, 1],
          end: [
            [1, null],
            [1, null],
          ],
        },
        {
          start: [1, 2],
          end: [
            [1, null],
            [2, null],
          ],
        },
      ])
      expect(result.usedQueries.size).toEqual(2)
      expect(toIndexFields(result.usedQueries)).toEqual(indexFields)
    })
  })
})

function toIndexFields(queries: Set<DbQuery>): { [field: string]: number } {
  const result = {}
  queries.forEach(q => (result[dbQueryToDottedField(q)] = 1))
  return result
}
