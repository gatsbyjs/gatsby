import { suggestIndex } from "../suggest-index"
import { IRunQueryArgs } from "../../../types"

type Sort = IRunQueryArgs["queryArgs"]["sort"]

describe(`suggestIndex`, () => {
  describe(`filter: yes; sort: no`, () => {
    const sort = { fields: [], order: [] }

    it(`throws on unknown comparators`, () => {
      const filter = { a: { unknown: `foo` } }
      expect(() => suggestIndex({ filter, sort })).toThrow()
    })

    it.each([[`eq`], [`in`], [`lt`], [`lte`], [`gt`], [`gte`]])(
      `supports "%s" comparator`,
      comparator => {
        const filter = {
          a: { [comparator]: `foo` },
        }
        expect(suggestIndex({ filter, sort })).toEqual({ a: 1 })
      }
    )

    it.each([[`ne`], [`nin`], [`regex`, `/foo/`], [`glob`]])(
      `does not support "%s" comparator`,
      (comparator, value = `foo`) => {
        const filter = {
          a: { [comparator]: value },
        }
        expect(suggestIndex({ filter, sort })).toBeUndefined()
      }
    )

    it.each([
      [
        { a: { in: 1 }, b: { eq: 1 }, c: { gt: 1 } },
        { b: 1, a: 1, c: 1 },
      ],
      [
        { a: { ne: 1 }, b: { in: 1 }, c: { gt: 1 } },
        { b: 1, c: 1 },
      ],
      [
        { a: { gt: 1 }, b: { gte: 1 }, c: { lte: 1 }, d: { lt: 1 } },
        { b: 1, c: 1, a: 1, d: 1 },
      ],
    ])(
      `includes fields in index by comparator specificity: %#`,
      (filter, expectedIndex) => {
        // expected specificity: eq, in, gte, lte, gt, lt
        expect(suggestIndex({ filter, sort })).toEqual(expectedIndex)
      }
    )

    it(`adds at most 4 filter fields to index`, () => {
      const filter = {
        a: { eq: 1 },
        b: { eq: 2 },
        c: { eq: 3 },
        d: { eq: 4 },
        e: { eq: 5 },
      }
      // expected specificity: eq, in, gte, lte, gt, lt
      expect(suggestIndex({ filter, sort })).toEqual({ a: 1, b: 1, c: 1, d: 1 })
    })
  })

  describe(`filter: no; sort: yes`, () => {
    const filter = {}

    it(`adds a single sort field to index`, () => {
      const sort = { fields: [`a`], order: [] }
      expect(suggestIndex({ filter, sort })).toEqual({ a: 1 })
    })

    it.each([
      [[], 1],
      [[`asc`], 1],
      [[`ASC`], 1],
      [[true], 1],
      [[`desc`], -1],
      [[`DESC`], -1],
      [[false], -1],
    ] as Array<[Sort["order"], number]>)(
      `supports sort order defined as %p`,
      (order, expected) => {
        const sort = { fields: [`a`], order }
        expect(suggestIndex({ filter, sort })).toEqual({ a: expected })
      }
    )

    it(`adds multiple sort fields to index`, () => {
      const sort = { fields: [`a`, `b`], order: [] }
      expect(suggestIndex({ filter, sort })).toEqual({ a: 1, b: 1 })
    })

    it(`adds at most 4 sort fields to index`, () => {
      const sort = {
        fields: [`a`, `b`, `c`, `d`, `e`],
        order: [],
      }
      expect(suggestIndex({ filter, sort })).toEqual({ a: 1, b: 1, c: 1, d: 1 })
    })

    it(`supports mixed sort order`, () => {
      const sort: Sort = {
        fields: [`a`, `b`, `c`],
        order: [`desc`, `asc`, `DESC`],
      }
      expect(suggestIndex({ filter, sort })).toEqual({ a: -1, b: 1, c: -1 })
    })
  })

  describe(`filter: yes; sort: yes`, () => {
    describe(`single "eq" filter`, () => {
      it(`uses "eq" for index prefix and "sort" fields as suffix`, () => {
        const filter = { a: { eq: `foo` } }
        const sort = { fields: [`b`, `c`], order: [] }

        expect(suggestIndex({ filter, sort })).toEqual({ a: 1, b: 1, c: 1 })
      })

      it(`merges "eq" filter with sibling "sort" field`, () => {
        const filter = { a: { eq: `foo` } }
        const sort: Sort = { fields: [`a`, `b`], order: [`desc`, `desc`] }

        expect(suggestIndex({ filter, sort })).toEqual({ a: -1, b: -1 })
      })

      it(`removes "eq" filter from "sort" tail`, () => {
        const filter = { b: { eq: `foo` } }
        const sort: Sort = { fields: [`a`, `b`], order: [] }

        expect(suggestIndex({ filter, sort })).toEqual({ b: 1, a: 1 })
      })

      it(`clears "sort" tail after "eq" field`, () => {
        const filter = { b: { eq: `foo` } }
        const sort: Sort = { fields: [`a`, `b`, `c`], order: [] }

        expect(suggestIndex({ filter, sort })).toEqual({ b: 1, a: 1 })
      })
    })

    describe(`single "in" filter`, () => {
      it(`prefers "in" filter to "sort" fields`, () => {
        // TODO: maybe it's actually possible to support this scenario.
        //  As each entry of "in" array runs a separate range query anyway.
        //  So
        //  { a: 1, b: 100, id: 1 }, { a: 1, b: 500, id: 2 } and
        //  { a: 2, b: 1, id: 3 }, { a: 2, b: 600, id: 4 }
        //  can potentially exploit the fact that they are sorted within each bucket and use mergeSorted to
        //  traverse in order: 3, 1, 2, 4
        //  it doesn't require deduplication (unless it is a MultiKey index)
        //  Can be costly if "in" has too many values (but probably not costlier than in-memory sort anyway)
        const filter = { a: { in: [1, 2] } }
        const sort = { fields: [`b`, `c`], order: [] }

        expect(suggestIndex({ filter, sort })).toEqual({ a: 1 })
      })

      it(`merges "in" filter with sibling "sort" field`, () => {
        const filter = { a: { in: `foo` } }
        const sort: Sort = { fields: [`a`, `b`], order: [`desc`, `desc`] }

        expect(suggestIndex({ filter, sort })).toEqual({ a: -1, b: -1 })
      })

      it(`removes "in" filter from "sort" tail`, () => {
        const filter = { b: { in: [`foo`] } }
        const sort: Sort = { fields: [`a`, `b`], order: [] }

        expect(suggestIndex({ filter, sort })).toEqual({ b: 1 })
      })
    })

    describe.each([`lt`, `lte`, `gt`, `gte`])(
      `single "%s" filter`,
      comparator => {
        it(`does this`, () => {
          expect(false).toEqual(true)
        })
      }
    )

    describe.skip(`multiple "eq" filters`, function () {
      it(`merges multiple "eq" filters with sibling "sort" fields`, () => {
        const filter = { b: { eq: `foo` }, a: { eq: `bar` } }
        const sort: Sort = { fields: [`a`, `b`], order: [`desc`, `desc`] }

        expect(suggestIndex({ filter, sort })).toEqual({ a: -1, b: -1 })
      })
    })
  })
})
