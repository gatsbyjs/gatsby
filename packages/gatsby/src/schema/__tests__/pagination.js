const { paginate } = require(`../resolvers`)

describe(`Paginate query results`, () => {
  const nodes = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
  const results = { entries: nodes, totalCount: nodes.length }

  it(`returns results`, async () => {
    const args = { limit: 1 }
    const nodes = paginate(results, args).edges.map(({ node }) => node)
    expect(nodes).toEqual([nodes[0]])
  })

  it(`returns next and previous nodes`, async () => {
    const args = { limit: 3 }
    const next = paginate(results, args).edges.map(({ next }) => next)
    const prev = paginate(results, args).edges.map(({ previous }) => previous)
    expect(next).toEqual([nodes[1], nodes[2], undefined])
    expect(prev).toEqual([undefined, nodes[0], nodes[1]])
  })

  it(`returns correct pagination info with limit only`, async () => {
    const args = { limit: 2 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(typeof totalCount).toBe(`function`)
    expect(await totalCount()).toBe(4)

    expect(pageInfo).toEqual({
      currentPage: 1,
      hasNextPage: true,
      hasPreviousPage: false,
      itemCount: 2,
      pageCount: expect.toBeFunction(),
      perPage: 2,
      totalCount: expect.toBeFunction(),
    })

    expect(await pageInfo.pageCount()).toEqual(2)
    expect(await pageInfo.totalCount()).toEqual(4)
  })

  it(`returns correct pagination info with skip and limit`, async () => {
    const args = { skip: 1, limit: 2 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(typeof totalCount).toBe(`function`)
    expect(await totalCount()).toBe(4)

    expect(pageInfo).toEqual({
      currentPage: 2,
      hasNextPage: true,
      hasPreviousPage: true,
      itemCount: 2,
      pageCount: expect.toBeFunction(),
      perPage: 2,
      totalCount: expect.toBeFunction(),
    })
    expect(await pageInfo.pageCount()).toBe(3)
    expect(await pageInfo.totalCount()).toBe(4)
  })

  it(`returns correct pagination info with skip and limit`, async () => {
    const args = { skip: 2, limit: 2 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(typeof totalCount).toBe(`function`)
    expect(await totalCount()).toBe(4)

    expect(pageInfo).toEqual({
      currentPage: 2,
      hasNextPage: false,
      hasPreviousPage: true,
      itemCount: 2,
      pageCount: expect.toBeFunction(),
      perPage: 2,
      totalCount: expect.toBeFunction(),
    })

    expect(await pageInfo.pageCount()).toEqual(2)
    expect(await pageInfo.totalCount()).toEqual(4)
  })

  it(`returns correct pagination info with skip only`, async () => {
    const args = { skip: 1 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(typeof totalCount).toBe(`function`)
    expect(await totalCount()).toBe(4)

    expect(pageInfo).toEqual({
      currentPage: 2,
      hasNextPage: false,
      hasPreviousPage: true,
      itemCount: 3,
      pageCount: expect.toBeFunction(),
      perPage: undefined,
      totalCount: expect.toBeFunction(),
    })
    expect(await pageInfo.pageCount()).toEqual(2)
    expect(await pageInfo.totalCount()).toEqual(4)
  })

  it(`returns correct pagination info with skip > totalCount`, async () => {
    const args = { skip: 10 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(typeof totalCount).toBe(`function`)
    expect(await totalCount()).toBe(4)

    expect(pageInfo).toEqual({
      currentPage: 2,
      hasNextPage: false,
      hasPreviousPage: true,
      itemCount: 0,
      pageCount: expect.toBeFunction(),
      perPage: undefined,
      totalCount: expect.toBeFunction(),
    })
    expect(await pageInfo.pageCount()).toEqual(2)
    expect(await pageInfo.totalCount()).toEqual(4)
  })

  it(`returns correct pagination info with limit > totalCount`, async () => {
    const args = { limit: 10 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(typeof totalCount).toBe(`function`)
    expect(await totalCount()).toBe(4)

    expect(pageInfo).toEqual({
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      itemCount: 4,
      pageCount: expect.toBeFunction(),
      perPage: 10,
      totalCount: expect.toBeFunction(),
    })
    expect(await pageInfo.pageCount()).toBe(1)
    expect(await pageInfo.totalCount()).toBe(4)
  })

  it(`returns correct pagination info with skip and resultOffset`, async () => {
    const args = { skip: 2, resultOffset: 1 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(typeof totalCount).toBe(`function`)
    expect(await totalCount()).toBe(4)

    expect(pageInfo).toEqual({
      currentPage: 2,
      hasNextPage: false,
      hasPreviousPage: true,
      itemCount: 3,
      pageCount: expect.toBeFunction(),
      perPage: undefined,
      totalCount: expect.toBeFunction(),
    })
    expect(await pageInfo.pageCount()).toEqual(2)
    expect(await pageInfo.totalCount()).toEqual(4)
  })

  it(`returns correct pagination info with skip, limit and resultOffset`, async () => {
    const args = { skip: 2, limit: 2, resultOffset: 1 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(typeof totalCount).toBe(`function`)
    expect(await totalCount()).toBe(4)

    expect(pageInfo).toEqual({
      currentPage: 2,
      hasNextPage: true,
      hasPreviousPage: true,
      itemCount: 2,
      pageCount: expect.toBeFunction(),
      perPage: 2,
      totalCount: expect.toBeFunction(),
    })
    expect(await pageInfo.pageCount()).toEqual(2)
    expect(await pageInfo.totalCount()).toEqual(4)
  })

  it(`throws when resultOffset is greater than skip`, async () => {
    const args = { limit: 2, resultOffset: 1 }
    expect(() => paginate(results, args)).toThrow(
      `Result offset cannot be greater than \`skip\` argument`
    )
  })

  it(`supports totalCount as function`, async () => {
    const args = { limit: 1 }
    const results = { entries: nodes, totalCount: () => 1000 }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(await totalCount()).toEqual(1000)
    expect(await pageInfo.totalCount()).toEqual(1000)
  })

  it(`supports totalCount as async function`, async () => {
    const args = { limit: 1 }
    const results = {
      entries: nodes,
      totalCount: async () => Promise.resolve(1100),
    }
    const { pageInfo, totalCount } = paginate(results, args)
    expect(await totalCount()).toEqual(1100)
    expect(await pageInfo.totalCount()).toEqual(1100)
  })
})
