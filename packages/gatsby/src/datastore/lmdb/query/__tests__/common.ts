import { matchesFilter } from "../common"
import { DbComparator } from "../../../common/query"

describe(`matchesFilter`, () => {
  describe(`$eq`, () => {
    const eq = { comparator: DbComparator.EQ, value: `2021-08-06` }

    it(`should match when value is equal to filter value`, () => {
      expect(matchesFilter(eq, `2021-08-06`)).toEqual(true)
    })
    it(`should not match when value is greater than filter value`, () => {
      expect(matchesFilter(eq, `2021-08-07`)).toEqual(false)
    })
    it(`should not match when value is less than filter value`, () => {
      expect(matchesFilter(eq, `2021-08-05`)).toEqual(false)
    })
  })

  describe(`$in`, () => {
    const $in = {
      comparator: DbComparator.IN,
      value: [`2021-08-06`, `2021-08-07`],
    }
    it(`should match when value matches one of filter values`, () => {
      expect(matchesFilter($in, `2021-08-06`)).toEqual(true)
      expect(matchesFilter($in, `2021-08-07`)).toEqual(true)
    })
    it(`should not match when value is greater than any filter value`, () => {
      expect(matchesFilter($in, `2021-08-08`)).toEqual(false)
    })
    it(`should not match when value is less than any filter value`, () => {
      expect(matchesFilter($in, `2021-08-05`)).toEqual(false)
    })
  })

  describe(`$gt`, () => {
    const gt = { comparator: DbComparator.GT, value: `2021-08-06` }

    it(`should not match when value is equal to filter value`, () => {
      expect(matchesFilter(gt, `2021-08-06`)).toEqual(false)
    })

    it(`should not match when value is less than filter value`, () => {
      expect(matchesFilter(gt, `2021-08-05`)).toEqual(false)
    })

    it(`should match when value is greater than filter value`, () => {
      expect(matchesFilter(gt, `2021-08-07`)).toEqual(true)
    })
  })

  describe(`$gte`, () => {
    const gte = { comparator: DbComparator.GTE, value: `2021-08-06` }

    it(`should match when value is equal to filter value`, () => {
      expect(matchesFilter(gte, `2021-08-06`)).toEqual(true)
    })

    it(`should not match when value is less than filter value`, () => {
      expect(matchesFilter(gte, `2021-08-05`)).toEqual(false)
    })

    it(`should match when value is greater than filter value`, () => {
      expect(matchesFilter(gte, `2021-08-07`)).toEqual(true)
    })
  })

  describe(`$lt`, () => {
    const lt = { comparator: DbComparator.LT, value: `2021-08-06` }

    it(`should not match when value is equal to filter value`, () => {
      expect(matchesFilter(lt, `2021-08-06`)).toEqual(false)
    })

    it(`should match when value is less than filter value`, () => {
      expect(matchesFilter(lt, `2021-08-05`)).toEqual(true)
    })

    it(`should not match when value is greater than filter value`, () => {
      expect(matchesFilter(lt, `2021-08-07`)).toEqual(false)
    })
  })

  describe(`$lte`, () => {
    const lte = { comparator: DbComparator.LTE, value: `2021-08-06` }

    it(`should match when value is equal to filter value`, () => {
      expect(matchesFilter(lte, `2021-08-06`)).toEqual(true)
    })

    it(`should match when value is less than filter value`, () => {
      expect(matchesFilter(lte, `2021-08-05`)).toEqual(true)
    })

    it(`should not match when value is greater than filter value`, () => {
      expect(matchesFilter(lte, `2021-08-07`)).toEqual(false)
    })
  })

  describe(`$ne`, () => {
    const ne = { comparator: DbComparator.NE, value: `2021-08-06` }

    it(`should not match when value is equal to filter value`, () => {
      expect(matchesFilter(ne, `2021-08-06`)).toEqual(false)
    })

    it(`should match when value is less than filter value`, () => {
      expect(matchesFilter(ne, `2021-08-05`)).toEqual(true)
    })

    it(`should match when value is greater than filter value`, () => {
      expect(matchesFilter(ne, `2021-08-07`)).toEqual(true)
    })
  })

  describe(`$nin`, () => {
    const nin = {
      comparator: DbComparator.NIN,
      value: [`2021-08-06`, `2021-08-07`],
    }
    it(`should not match when value equal to one of filter values`, () => {
      expect(matchesFilter(nin, `2021-08-06`)).toEqual(false)
      expect(matchesFilter(nin, `2021-08-07`)).toEqual(false)
    })
    it(`should match when value is greater than any filter value`, () => {
      expect(matchesFilter(nin, `2021-08-08`)).toEqual(true)
    })
    it(`should match when value is less than any filter value`, () => {
      expect(matchesFilter(nin, `2021-08-05`)).toEqual(true)
    })
  })

  describe(`$regex`, () => {
    const regex = {
      comparator: DbComparator.REGEX,
      value: /2021-08/,
    }
    it(`should match when value matches filter regex`, () => {
      expect(matchesFilter(regex, `2021-08-06`)).toEqual(true)
      expect(matchesFilter(regex, `2021-08-07`)).toEqual(true)
    })
    it(`should not match when value is greater than filter regex`, () => {
      expect(matchesFilter(regex, `2021-09-01`)).toEqual(false)
    })
    it(`should not match when value is less than filter regex`, () => {
      expect(matchesFilter(regex, `2021-07-01`)).toEqual(false)
    })
  })
})
