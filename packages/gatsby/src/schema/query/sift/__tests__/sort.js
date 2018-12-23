const sort = require(`../sort`)

describe(`Sort query results`, () => {
  it(`sorts results by id (default)`, () => {
    const results = [{ id: `third` }, { id: `first` }, { id: `second` }]
    const expected = [{ id: `first` }, { id: `second` }, { id: `third` }]
    const sorted = results.sort(sort())
    expect(sorted).toEqual(expected)
  })

  it(`sorts results in descending order`, () => {
    const results = [{ id: `third` }, { id: `first` }, { id: `second` }]
    const expected = [{ id: `third` }, { id: `second` }, { id: `first` }]
    const sorted = results.sort(sort({ order: `DESC` }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts results by integer field`, () => {
    const results = [{ int: 10 }, { int: 1 }, { int: 5 }]
    const expected = [{ int: 1 }, { int: 5 }, { int: 10 }]
    const sorted = results.sort(sort({ fields: [`int`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts results by float field`, () => {
    const results = [{ float: 1.1 }, { float: 0.1 }, { float: -1.1 }]
    const expected = [{ float: -1.1 }, { float: 0.1 }, { float: 1.1 }]
    const sorted = results.sort(sort({ fields: [`float`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts results by string field`, () => {
    const results = [
      { string: `third` },
      { string: `first` },
      { string: `second` },
    ]
    const expected = [
      { string: `first` },
      { string: `second` },
      { string: `third` },
    ]
    const sorted = results.sort(sort({ fields: [`string`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts results by string field (ignore case)`, () => {
    const results = [
      { string: `Third` },
      { string: `First` },
      { string: `second` },
    ]
    const expected = [
      { string: `First` },
      { string: `second` },
      { string: `Third` },
    ]
    const sorted = results.sort(sort({ fields: [`string`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts results by string field (locale-aware)`, () => {
    const results = [{ string: `ö` }, { string: `o` }, { string: `ä` }]
    const expected = [{ string: `ä` }, { string: `o` }, { string: `ö` }]
    const sorted = results.sort(sort({ fields: [`string`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts results by string object field`, () => {
    const results = [
      { string: new String(`third`) },
      { string: new String(`first`) },
      { string: new String(`second`) },
    ]
    const expected = [
      { string: new String(`first`) },
      { string: new String(`second`) },
      { string: new String(`third`) },
    ]
    const sorted = results.sort(sort({ fields: [`string`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts results by date field`, () => {
    const results = [{ date: `third` }, { date: `first` }, { date: `second` }]
    const expected = [{ date: `first` }, { date: `second` }, { date: `third` }]
    const sorted = results.sort(sort({ fields: [`date`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts results by array field`, () => {
    const results = [
      { array: [`foo`, `third`] },
      { array: [`foo`, `first`] },
      { array: [`foo`, `second`] },
    ]
    const expected = [
      { array: [`foo`, `first`] },
      { array: [`foo`, `second`] },
      { array: [`foo`, `third`] },
    ]
    const sorted = results.sort(sort({ fields: [`array`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts results by nested field`, () => {
    const results = [
      { deeply: { nested: { ints: [1, 10, 5] } } },
      { deeply: { nested: { ints: [1, 5, 10] } } },
      { deeply: { nested: { ints: [1, 5, 5] } } },
    ]
    const expected = [
      { deeply: { nested: { ints: [1, 5, 5] } } },
      { deeply: { nested: { ints: [1, 5, 10] } } },
      { deeply: { nested: { ints: [1, 10, 5] } } },
    ]
    const sorted = results.sort(sort({ fields: [`deeply.nested.ints`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts results by multiple fields`, () => {
    const results = [
      { deeply: { nested: { ints: [1, 10, 5] }, string: `third` } },
      { deeply: { nested: { ints: [1, 5, 5] }, string: `second` } },
      { deeply: { nested: { ints: [1, 5, 5] }, string: `first` } },
    ]
    const expected = [
      { deeply: { nested: { ints: [1, 5, 5] }, string: `first` } },
      { deeply: { nested: { ints: [1, 5, 5] }, string: `second` } },
      { deeply: { nested: { ints: [1, 10, 5] }, string: `third` } },
    ]
    const sorted = results.sort(
      sort({ fields: [`deeply.nested.ints`, `deeply.string`] })
    )
    expect(sorted).toEqual(expected)
  })

  it(`sorts results by nested array field`, () => {
    const results = [
      { array: [{ string: `foo` }, { string: `third` }] },
      { array: [{ string: `foo` }, { string: `first` }] },
      { array: [{ string: `foo` }, { string: `second` }] },
    ]
    const expected = [
      { array: [{ string: `foo` }, { string: `first` }] },
      { array: [{ string: `foo` }, { string: `second` }] },
      { array: [{ string: `foo` }, { string: `third` }] },
    ]
    const sorted = results.sort(sort({ fields: [`array.string`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts arrays with different lengths`, () => {
    // Note that arrays are only compared up to the minimum array length,
    // i.e. the `third` element is simply ignored.
    const results = [
      { array: [`foo`, `second`, `third`] },
      { array: [`first`] },
      { array: [`foo`, `second`] },
    ]
    const expected = [
      { array: [`first`] },
      { array: [`foo`, `second`, `third`] },
      { array: [`foo`, `second`] },
    ]
    const sorted = results.sort(sort({ fields: [`array`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts null fields to the front`, () => {
    const results = [{ string: `b` }, { string: null }, { string: `a` }]
    const expected = [{ string: null }, { string: `a` }, { string: `b` }]
    const sorted = results.sort(sort({ fields: [`string`] }))
    expect(sorted).toEqual(expected)
  })

  it(`sorts descending null fields to the back `, () => {
    const results = [{ string: `b` }, { string: null }, { string: `a` }]
    const expected = [{ string: `b` }, { string: `a` }, { string: null }]
    const sorted = results.sort(sort({ fields: [`string`], order: `DESC` }))
    expect(sorted).toEqual(expected)
  })
})
