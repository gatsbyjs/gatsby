import {
  createDbQueriesFromObject,
  getFilterStatement,
} from "../../../common/query"
import {
  getIndexRanges,
  BinaryInfinityPositive,
  BinaryInfinityNegative,
} from "../filter-using-index"
import { undefinedSymbol } from "../create-index"

const undefinedNextEdge = [undefinedSymbol, BinaryInfinityPositive]

describe(`getIndexRangeQueries`, () => {
  const allFilter = {
    mixedEqLteGte: { $eq: 1, $lte: 10, $gte: 6 },
    mixedInLteGte: { $in: [1, 2], $lte: 10, $gte: 6 },
  }
  const dbQueries = createDbQueriesFromObject(allFilter)

  describe(`Ranges on a single field`, () => {
    // Each row is:
    // [filter, expected ranges, expected used predicates]
    // if expected used predicates not set - expecting the first from filter
    test.each([
      [{ $eq: 1 }, [{ start: [1], end: [[1, BinaryInfinityPositive]] }]],
      [{ $eq: -1 }, [{ start: [-1], end: [[-1, BinaryInfinityPositive]] }]],
      [
        { $in: [1, 2] },
        [
          { start: [1], end: [[1, BinaryInfinityPositive]] },
          { start: [2], end: [[2, BinaryInfinityPositive]] },
        ],
      ],
      [
        // Order of values for $in predicate is irrelevant
        // (it must be sorted the same way as the corresponding index field)
        { $in: [2, 1] },
        [
          { start: [1], end: [[1, BinaryInfinityPositive]] },
          { start: [2], end: [[2, BinaryInfinityPositive]] },
        ],
      ],
      [{ $lt: 2 }, [{ start: [undefinedNextEdge], end: [2] }]],
      [
        { $lte: 3 },
        [
          {
            start: [undefinedNextEdge],
            end: [[3, BinaryInfinityPositive]],
          },
        ],
      ],
      [
        { $gt: 4 },
        [
          {
            start: [[4, BinaryInfinityPositive]],
            end: [BinaryInfinityPositive],
          },
        ],
      ],
      [{ $gte: 5 }, [{ start: [5], end: [BinaryInfinityPositive] }]],
      [
        { $gt: 6, $lte: 10 },
        [
          {
            start: [[6, BinaryInfinityPositive]],
            end: [[10, BinaryInfinityPositive]],
          },
        ],
        [`$gt`, `$lte`],
      ],
      [
        { $gt: 6, $lt: 10 },
        [{ start: [[6, BinaryInfinityPositive]], end: [10] }],
        [`$gt`, `$lt`],
      ],
      [
        { $gte: 6, $lte: 10 },
        [{ start: [6], end: [[10, BinaryInfinityPositive]] }],
        [`$gte`, `$lte`],
      ],
      [{ $gte: 6, $lt: 10 }, [{ start: [6], end: [10] }], [`$gte`, `$lt`]],
      [
        { $eq: 1, $lte: 10, $gte: 6 },
        [{ start: [1], end: [[1, BinaryInfinityPositive]] }],
        [`$eq`],
      ],
      // Nulls hackery
      // $eq: null in gatsby must also include undefined!
      [
        { $eq: null },
        [
          {
            start: [null],
            end: [[null, BinaryInfinityPositive]],
          },
          {
            start: [undefinedSymbol],
            end: [[undefinedSymbol, BinaryInfinityPositive]],
          },
        ],
      ],
      [
        { $in: [null, null] },
        [
          {
            start: [null],
            end: [[null, BinaryInfinityPositive]],
          },
          {
            start: [undefinedSymbol],
            end: [[undefinedSymbol, BinaryInfinityPositive]],
          },
        ],
      ],
      [
        // Essentially no-op
        { $gt: null },
        [
          {
            start: [[null, BinaryInfinityPositive]],
            end: [[null, BinaryInfinityPositive]],
          },
        ],
      ],
      [
        { $lt: null },
        [
          {
            start: [BinaryInfinityNegative],
            end: [null],
          },
        ],
      ],
    ])(`%o`, (filter, expectedRange, expectedUsed = []) => {
      const indexFields = new Map([[`field`, 1]])
      const dbQueries = createDbQueriesFromObject({ field: filter })
      const result = getIndexRanges(dbQueries, indexFields)
      expect(result.ranges).toEqual(expectedRange)

      if (expectedUsed.length) {
        const expectedDbQueries = dbQueries.find(q =>
          expectedUsed.includes(getFilterStatement(q).comparator)
        )
        expect(result.usedQueries.size).toEqual(expectedUsed.length)
        expect(result.usedQueries).toContain(expectedDbQueries)
      } else {
        expect(result.usedQueries.size).toEqual(1)
        expect(result.usedQueries).toContain(dbQueries[0])
      }
    })
  })

  describe(`Index on two fields`, () => {
    // TODO
  })
})
