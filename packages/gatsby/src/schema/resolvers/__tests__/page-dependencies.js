const withPageDependencies = require(`../page-dependencies`)

const createPageDependency = require(`../../../redux/actions/add-page-dependency`)
jest.mock(`../../../redux/actions/add-page-dependency`)

const findOne = type => rp => {
  const result = { id: 1 }
  return result
}

const findMany = type => rp => {
  const results = [{ id: 1 }, { id: 2 }]
  return results
}

const paginate = type => rp => {
  const results = { items: [{ id: 1 }, { id: 2 }], pageInfo: {} }
  return results
}

describe(`Create page dependencies`, () => {
  beforeEach(() => {
    createPageDependency.mockReset()
  })

  it(`processes single result`, async () => {
    const wrappedResolver = withPageDependencies(findOne)
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Bar` } },
    }
    await wrappedResolver(type)(rp)
    expect(createPageDependency).toHaveBeenCalledTimes(1)
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: 1,
    })
  })

  it(`processes single result from top level query field`, async () => {
    const wrappedResolver = withPageDependencies(findOne)
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Query` } },
    }
    await wrappedResolver(type)(rp)
    expect(createPageDependency).toHaveBeenCalledTimes(1)
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: 1,
    })
  })

  it(`handles no result`, async () => {
    const wrappedResolver = withPageDependencies(() => () => null)
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Bar` } },
    }
    const result = await wrappedResolver(type)(rp)
    expect(createPageDependency).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it(`handles no result from top level query field`, async () => {
    const wrappedResolver = withPageDependencies(() => () => null)
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Query` } },
    }
    await wrappedResolver(type)(rp)
    expect(createPageDependency).not.toHaveBeenCalled()
  })

  it(`processes multiple results`, async () => {
    const wrappedResolver = withPageDependencies(findMany)
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Bar` } },
    }
    await wrappedResolver(type)(rp)
    expect(createPageDependency).toHaveBeenCalledTimes(2)
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: 1,
    })
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: 2,
    })
  })

  it(`creates connection for multiple results from top level query field`, async () => {
    const wrappedResolver = withPageDependencies(findMany)
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Query` } },
    }
    await wrappedResolver(type)(rp)
    expect(createPageDependency).toHaveBeenCalledTimes(1)
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      connection: `Foo`,
    })
  })

  it(`handles no results`, async () => {
    const wrappedResolver = withPageDependencies(() => () => [])
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Bar` } },
    }
    const result = await wrappedResolver(type)(rp)
    expect(createPageDependency).not.toHaveBeenCalled()
    expect(result).toEqual([])
  })

  it(`creates connection even if no results returned from top level query field`, async () => {
    const wrappedResolver = withPageDependencies(() => () => [])
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Query` } },
    }
    await wrappedResolver(type)(rp)
    expect(createPageDependency).toHaveBeenCalledTimes(1)
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      connection: `Foo`,
    })
  })

  it(`processes multiple paginated results`, async () => {
    const wrappedResolver = withPageDependencies(paginate)
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Bar` } },
    }
    await wrappedResolver(type)(rp)
    expect(createPageDependency).toHaveBeenCalledTimes(2)
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: 1,
    })
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      nodeId: 2,
    })
  })

  it(`creates connection for multiple paginated results from top level query field`, async () => {
    const wrappedResolver = withPageDependencies(paginate)
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Query` } },
    }
    await wrappedResolver(type)(rp)
    expect(createPageDependency).toHaveBeenCalledTimes(1)
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      connection: `Foo`,
    })
  })

  it(`handles no paginated results`, async () => {
    const wrappedResolver = withPageDependencies(() => () => ({
      items: [null],
      pageInfo: {},
    }))
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Bar` } },
    }
    const result = await wrappedResolver(type)(rp)
    expect(createPageDependency).not.toHaveBeenCalled()
    expect(result.items).toEqual([null])
  })

  it(`creates connection even if no results returned from top level paginated query field`, async () => {
    const wrappedResolver = withPageDependencies(() => () => ({
      items: [],
      pageInfo: {},
    }))
    const type = `Foo`
    const rp = {
      context: { path: `foo` },
      info: { parentType: { name: `Query` } },
    }
    await wrappedResolver(type)(rp)
    expect(createPageDependency).toHaveBeenCalledTimes(1)
    expect(createPageDependency).toHaveBeenCalledWith({
      path: `foo`,
      connection: `Foo`,
    })
  })

  it(`does not create page dependencies when no path in context`, async () => {
    const wrappedResolver = withPageDependencies(findOne)
    const type = `Foo`
    const rp = {
      context: {},
      info: { parentType: { name: `Bar` } },
    }
    await wrappedResolver(type)(rp)
    expect(createPageDependency).not.toHaveBeenCalled()
  })
})
