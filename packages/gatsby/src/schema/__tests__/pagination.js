const { paginate } = require(`../resolvers`)

describe(`Paginate query results`, () => {
  const results = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]

  it(`returns results`, async () => {
    const args = { limit: 1 }
    const nodes = paginate(results, args).edges.map(({ node }) => node)
    expect(nodes).toEqual([results[0]])
  })

  it(`returns next and previous nodes`, async () => {
    const args = { limit: 3 }
    const next = paginate(results, args).edges.map(({ next }) => next)
    const prev = paginate(results, args).edges.map(({ previous }) => previous)
    expect(next).toEqual([results[1], results[2], undefined])
    expect(prev).toEqual([undefined, results[0], results[1]])
  })

  it(`returns correct pagination info with limit only`, async () => {
    const args = { limit: 2 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(totalCount).toBe(4)
    expect(pageInfo).toEqual({
      currentPage: 1,
      hasNextPage: true,
      hasPreviousPage: false,
      itemCount: 2,
      pageCount: 2,
      perPage: 2,
      totalCount: 4,
    })
  })

  it(`returns correct pagination info with skip and limit`, async () => {
    const args = { skip: 1, limit: 2 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(totalCount).toBe(4)
    expect(pageInfo).toEqual({
      currentPage: 2,
      hasNextPage: true,
      hasPreviousPage: true,
      itemCount: 2,
      pageCount: 3,
      perPage: 2,
      totalCount: 4,
    })
  })

  it(`returns correct pagination info with skip and limit`, async () => {
    const args = { skip: 2, limit: 2 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(totalCount).toBe(4)
    expect(pageInfo).toEqual({
      currentPage: 2,
      hasNextPage: false,
      hasPreviousPage: true,
      itemCount: 2,
      pageCount: 2,
      perPage: 2,
      totalCount: 4,
    })
  })

  it(`returns correct pagination info with skip only`, async () => {
    const args = { skip: 1 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(totalCount).toBe(4)
    expect(pageInfo).toEqual({
      currentPage: 2,
      hasNextPage: false,
      hasPreviousPage: true,
      itemCount: 3,
      pageCount: 2,
      perPage: undefined,
      totalCount: 4,
    })
  })

  it(`returns correct pagination info with skip > totalCount`, async () => {
    const args = { skip: 10 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(totalCount).toBe(4)
    expect(pageInfo).toEqual({
      currentPage: 2,
      hasNextPage: false,
      hasPreviousPage: true,
      itemCount: 0,
      pageCount: 2,
      perPage: undefined,
      totalCount: 4,
    })
  })

  it(`returns correct pagination info with limit > totalCount`, async () => {
    const args = { limit: 10 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(totalCount).toBe(4)
    expect(pageInfo).toEqual({
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      itemCount: 4,
      pageCount: 1,
      perPage: 10,
      totalCount: 4,
    })
  })
})
