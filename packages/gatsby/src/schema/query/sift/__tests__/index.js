const { query } = require(`..`)

const nodes = [
  {
    id: 1,
    int: 1,
    float: 0.1,
    date: new Date(2018, 1, 1),
    string: `foo`,
    array: [1, 2, 3],
    arrayOfObjects: [{ foo: false }],
  },
  {
    id: 2,
    int: 0,
    float: 1.1,
    date: new Date(2018, 1, 2),
    string: `bar`,
    array: [3, 4, 5],
    arrayOfObjects: [{ foo: true }, { foo: false }],
  },
  {
    id: 3,
    int: -1,
    float: -1.1,
    date: new Date(2018, 1, 2),
    string: null,
    array: [6, 7, 8],
    arrayOfObjects: [],
  },
]

describe(`Query with Sift`, () => {
  it(`finds one result matching filter argument`, () => {
    const firstResultOnly = true
    const args = {
      filter: { id: { eq: 2 } },
    }
    const item = query(nodes, args, firstResultOnly)
    expect(item).toEqual(expect.objectContaining({ id: 2, int: 0 }))
  })

  it(`finds one result matching filter arguments`, () => {
    const firstResultOnly = true
    const args = {
      filter: { id: { eq: 2 }, int: { in: [0, 1] } },
    }
    const item = query(nodes, args, firstResultOnly)
    expect(item).toEqual(expect.objectContaining({ id: 2, int: 0 }))
  })

  it(`returns only first matching result`, () => {
    const firstResultOnly = true
    const args = {
      filter: { int: { in: [0, 1] } },
    }
    const item = query(nodes, args, firstResultOnly)
    expect(item).toEqual(expect.objectContaining({ id: 1, int: 1 }))
  })

  it(`finds all results matching filter argument`, () => {
    const args = {
      filter: { date: { gte: new Date(2018, 1, 2) } },
    }
    const { items } = query(nodes, args)
    expect(items).toEqual([
      expect.objectContaining({ id: 2 }),
      expect.objectContaining({ id: 3 }),
    ])
  })

  it(`finds all results matching filter arguments`, () => {
    const args = {
      filter: { array: { in: [3, 4, 5] }, string: { ne: `bar` } },
    }
    const { items } = query(nodes, args)
    expect(items.length).toBe(1)
    expect(items.map(item => item.id)).toEqual([1])
  })

  it(`finds all results matching filter arguments`, () => {
    const args = {
      filter: { arrayOfObjects: { foo: { eq: false } } },
    }
    const { items } = query(nodes, args)
    expect(items.length).toBe(2)
    expect(items.map(item => item.id)).toEqual([1, 2])
  })

  it(`returns number of matches`, () => {
    const args = {
      filter: { arrayOfObjects: { foo: { eq: false } } },
    }
    const { count } = query(nodes, args)
    expect(count).toBe(2)
  })

  it(`sorts results`, () => {
    const args = {
      filter: { int: { gte: -1 } },
      sort: { fields: [`int`] },
    }
    const { items } = query(nodes, args)
    expect(items.map(item => item.id)).toEqual([3, 2, 1])
  })

  it(`skips and limits results`, () => {
    const args = {
      filter: { int: { gte: -1 } },
      skip: 1,
      limit: 2,
    }
    const { items } = query(nodes, args)
    expect(items.length).toBe(2)
    expect(items.map(item => item.id)).toEqual([2, 3])
  })

  it(`handles only skip`, () => {
    const args = {
      filter: { int: { gte: -1 } },
      skip: 1,
    }
    const { items } = query(nodes, args)
    expect(items.length).toBe(2)
    expect(items.map(item => item.id)).toEqual([2, 3])
  })

  it(`handles only limit`, () => {
    const args = {
      filter: { int: { gte: -1 } },
      limit: 2,
    }
    const { items } = query(nodes, args)
    expect(items.length).toBe(2)
    expect(items.map(item => item.id)).toEqual([1, 2])
  })

  it(`returns all nodes when no filter specified`, () => {
    const { items } = query(nodes, {})
    expect(items.length).toBe(3)
    expect(items.map(item => item.id)).toEqual([1, 2, 3])
  })

  it(`returns sorted nodes when no filter specified`, () => {
    const args = {
      sort: { fields: [`float`], order: `DESC` },
    }
    const { items } = query(nodes, args)
    expect(items.length).toBe(3)
    expect(items.map(item => item.id)).toEqual([2, 1, 3])
  })
})
