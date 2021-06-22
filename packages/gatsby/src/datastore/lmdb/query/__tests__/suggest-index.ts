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
        expect(suggestIndex({ filter, sort })).toEqual([[`a`, 1]])
      }
    )

    it.each([[`ne`], [`nin`], [`regex`, `/foo/`], [`glob`]])(
      `does not support "%s" comparator`,
      (comparator, value = `foo`) => {
        const filter = {
          a: { [comparator]: value },
        }
        expect(suggestIndex({ filter, sort })).toEqual([])
      }
    )

    it.each([
      [{ a: { in: 1 }, b: { eq: 1 }, c: { gt: 1 } }, [`b`, `a`, `c`]],
      [{ a: { ne: 1 }, b: { in: 1 }, c: { gt: 1 } }, [`b`, `c`]],
      [
        { a: { gt: 1 }, b: { gte: 1 }, c: { lte: 1 }, d: { lt: 1 } },
        [`b`, `c`, `a`, `d`],
      ],
    ])(
      `includes fields in index by comparator specificity: %#`,
      (filter, expectedFields) => {
        // expected specificity: eq, in, gte, lte, gt, lt
        const expected = expectedFields.map(f => [f, 1])
        expect(suggestIndex({ filter, sort })).toEqual(expected)
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
      expect(suggestIndex({ filter, sort })).toEqual([
        [`a`, 1],
        [`b`, 1],
        [`c`, 1],
        [`d`, 1],
      ])
    })
  })

  describe(`filter: no; sort: yes`, () => {
    const filter = {}

    it(`adds a single sort field to index`, () => {
      const sort = { fields: [`a`], order: [] }
      expect(suggestIndex({ filter, sort })).toEqual([[`a`, 1]])
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
        expect(suggestIndex({ filter, sort })).toEqual([[`a`, expected]])
      }
    )

    it(`adds multiple sort fields to index`, () => {
      const sort = { fields: [`a`, `b`], order: [] }
      expect(suggestIndex({ filter, sort })).toEqual([
        [`a`, 1],
        [`b`, 1],
      ])
    })

    it(`adds at most 4 sort fields to index`, () => {
      const sort = {
        fields: [`a`, `b`, `c`, `d`, `e`],
        order: [],
      }
      expect(suggestIndex({ filter, sort })).toEqual([
        [`a`, 1],
        [`b`, 1],
        [`c`, 1],
        [`d`, 1],
      ])
    })

    it(`only sorts in one direction`, () => {
      // This is a limitation of our implementation :/
      const sort: Sort = {
        fields: [`a`, `b`, `c`],
        order: [`desc`, `DESC`, `asc`],
      }
      expect(suggestIndex({ filter, sort })).toEqual([
        [`a`, -1],
        [`b`, -1],
      ])
    })

    it.todo(`supports mixed sort order`)
  })

  describe(`filter: yes; sort: yes`, () => {
    describe(`single "eq" filter`, () => {
      it(`uses "eq" for index prefix and "sort" fields as suffix`, () => {
        const filter = { a: { eq: `foo` } }
        const sort = { fields: [`b`, `c`], order: [] }

        expect(suggestIndex({ filter, sort })).toEqual([
          [`a`, 1],
          [`b`, 1],
          [`c`, 1],
        ])
      })

      it(`merges "eq" filter with sibling "sort" field`, () => {
        const filter = { a: { eq: `foo` } }
        const sort: Sort = { fields: [`a`, `b`], order: [`desc`, `desc`] }

        expect(suggestIndex({ filter, sort })).toEqual([
          [`a`, -1],
          [`b`, -1],
        ])
      })

      it(`removes "eq" filter from "sort" tail`, () => {
        const filter = { b: { eq: `foo` } }
        const sort: Sort = { fields: [`a`, `b`], order: [] }

        expect(suggestIndex({ filter, sort })).toEqual([
          [`b`, 1],
          [`a`, 1],
        ])
      })

      it(`removes "eq" field from the middle of "sort" list`, () => {
        const filter = { b: { eq: `foo` } }
        const sort: Sort = { fields: [`a`, `b`, `c`], order: [] }

        expect(suggestIndex({ filter, sort })).toEqual([
          [`b`, 1],
          [`a`, 1],
          [`c`, 1],
        ])
      })
    })

    describe(`multiple "eq" filters`, () => {
      it(`uses "eq" filters for index prefix and "sort" fields as suffix`, () => {
        const filter = { a: { eq: `foo` }, b: { eq: `bar` } }
        const sort = { fields: [`c`, `d`], order: [] }

        expect(suggestIndex({ filter, sort })).toEqual([
          [`a`, 1],
          [`b`, 1],
          [`c`, 1],
          [`d`, 1],
        ])
      })

      it(`merges "eq" filters with overlapping "sort" fields`, () => {
        const filter = { a: { eq: `foo` }, b: { eq: `bar` }, c: { eq: `baz` } }
        const sort = { fields: [`c`, `b`], order: [] }

        // TODO: consider sorting "eq" fields in the order they appear in "sort"
        //  The assumption here is that the same sort order may be used somewhere else,
        //  so maybe this index can be re-used more often

        expect(suggestIndex({ filter, sort })).toEqual([
          [`a`, 1],
          [`c`, 1],
          [`b`, 1],
        ])
      })

      it(`removes "eq" filters from "sort" tail`, () => {
        const filter = { b: { eq: `foo` }, c: { eq: `bar` } }
        const sort: Sort = {
          fields: [`a`, `b`, `c`],
          order: [`desc`, `desc`, `desc`],
        }
        expect(suggestIndex({ filter, sort })).toEqual([
          [`b`, -1],
          [`c`, -1],
          [`a`, -1],
        ])
      })

      it(`removes "eq" fields from the middle of "sort" list`, () => {
        const filter = { b: { eq: `bar` }, c: { eq: `bar` } }
        const sort: Sort = { fields: [`a`, `c`, `b`, `d`], order: [] }

        expect(suggestIndex({ filter, sort })).toEqual([
          [`b`, 1],
          [`c`, 1],
          [`a`, 1],
          [`d`, 1],
        ])
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
        expect(suggestIndex({ filter, sort })).toEqual([[`a`, 1]]) // TODO: .toEqual([[`a`, 1], [`b`, 1], [`c`, 1]]])
      })

      it(`merges "in" filter with sibling "sort" field`, () => {
        const filter = { a: { in: `foo` } }
        const sort: Sort = { fields: [`a`, `b`], order: [`desc`, `desc`] }
        expect(suggestIndex({ filter, sort })).toEqual([
          [`a`, -1],
          [`b`, -1],
        ])
      })

      it(`discards "sort" fields that do not overlap with "in" filter`, () => {
        const filter = { b: { in: [`foo`] } }
        const sort: Sort = { fields: [`a`, `b`, `c`], order: [] }
        expect(suggestIndex({ filter, sort })).toEqual([[`b`, 1]])
      })
    })

    describe.each([`lt`, `lte`, `gt`, `gte`])(
      `single "%s" filter`,
      comparator => {
        it(`prefers "sort" fields to single "${comparator}" filter`, () => {
          const filter = { a: { [comparator]: [1, 2] } }
          const sort = { fields: [`b`, `c`], order: [] }
          expect(suggestIndex({ filter, sort })).toEqual([
            [`b`, 1],
            [`c`, 1],
          ])
        })

        it(`merges "${comparator}" filter with sibling "sort" field`, () => {
          const filter = { a: { [comparator]: `foo` } }
          const sort: Sort = { fields: [`a`, `b`], order: [`desc`, `desc`] }
          expect(suggestIndex({ filter, sort })).toEqual([
            [`a`, -1],
            [`b`, -1],
          ])
        })
      }
    )

    describe.each([
      [`gt`, `lt`],
      [`gt`, `lte`],
      [`lt`, `gt`],
      [`lte`, `gt`],
      [`lt`, `gt`],
    ])(`single enclosed "%s - %s" filter`, (left, right) => {
      it(`prefers enclosed filter to non-overlapping "sort" fields`, () => {
        const filter = { a: { [left]: `foo`, [right]: `bar` } }
        const sort = { fields: [`b`, `c`], order: [] }
        expect(suggestIndex({ filter, sort })).toEqual([[`a`, 1]])
      })

      it(`merges field with enclosed filter with sibling "sort" field`, () => {
        const filter = { a: { [left]: `foo`, [right]: `bar` } }
        const sort: Sort = { fields: [`a`, `b`], order: [`desc`, `desc`] }
        expect(suggestIndex({ filter, sort })).toEqual([
          [`a`, -1],
          [`b`, -1],
        ])
      })
    })
  })
})
