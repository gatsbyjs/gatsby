const preprocessAggregations = require(`../preprocess-aggregations`)

test(`Collection keys with empty (non-array) values are removed`, () => {
  const before = {
    collection_1: {
      aggregation_1: [],
    },
    collection_2: null,
    collection_3: {},
  }
  const after = {
    collection_1: {
      aggregation_1: [],
    },
  }
  expect(preprocessAggregations(before)).toEqual(after)
})

test(`Nested aggregation keys with non-array values are removed`, () => {
  const before = {
    collection_1: {
      aggregation_1: [],
      aggregation_2: {},
      aggregation_3: null,
      aggregation_4: [{ $set: { a: 1 } }],
    },
    collection_2: {
      aggregation_1: {},
      aggregation_2: null,
    },
  }
  const after = {
    collection_1: {
      aggregation_1: [],
      aggregation_4: [{ $set: { a: 1 } }],
    },
  }
  expect(preprocessAggregations(before)).toEqual(after)
})

test(`Collection values with unnamed (array) aggregations are transformed into named format`, () => {
  const before = {
    collection_1: [],
    collection_2: [{ $set: { a: 1 } }],
  }
  const after = {
    collection_1: {
      aggregation: [],
    },
    collection_2: {
      aggregation: [{ $set: { a: 1 } }],
    },
  }
  expect(preprocessAggregations(before)).toEqual(after)
})
