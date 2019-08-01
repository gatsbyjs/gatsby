const { interpret } = require(`xstate`)
const machine = require(`../page-component`)

jest.mock(`../../../query`)
const { enqueueExtractedQueryId, runQueuedQueries } = require(`../../../query`)

const getService = (args = {}) =>
  interpret(
    machine.withContext({
      componentPath: `/a/path.js`,
      query: ``,
      pages: new Set([`/`]),
      isInBootstrap: true,
      ...args,
    })
  ).start()

const sleep = (delay = 50) => new Promise(resolve => setTimeout(resolve, delay))

describe(`bootstrap`, () => {
  beforeEach(() => {
    enqueueExtractedQueryId.mockClear()
    runQueuedQueries.mockClear()
  })

  it(`handles not running queries during bootstrap`, () => {
    const service = getService()
    // Initial state
    expect(service.state.value).toEqual(`inactiveWhileBootstrapping`)

    // Query extracted
    service.send({ type: `QUERY_CHANGED`, query: `yo` })
    expect(service.state.value).toEqual(`runningPageQueries`)
    expect(service.state.context.query).toEqual(`yo`)

    // Queries complete
    service.send(`QUERIES_COMPLETE`)
    expect(service.state.value).toEqual(`idle`)

    // Bootstrapped finished
    service.send(`BOOTSTRAP_FINISHED`)
    expect(service.state.value).toEqual(`idle`)
    expect(service.state.context.isInBootstrap).toEqual(false)
  })

  it(`won't run queries if the page component has a JS error`, () => {
    const service = getService({ isInBootstrap: false })

    service.send(`QUERY_EXTRACTION_BABEL_ERROR`)
    expect(service.state.value).toEqual(`queryExtractionBabelError`)
    service.send(`QUERY_CHANGED`)
    expect(service.state.value).toEqual(`queryExtractionBabelError`)
  })

  it(`won't queue extra query when page if new page is created in bootstrap`, async () => {
    const service = getService()
    service.send({ type: `NEW_PAGE_CREATED`, path: `/test` })
    // there is setTimeout in action handler for `NEW_PAGE_CREATED`
    await sleep()
    expect(runQueuedQueries).not.toBeCalled()
  })

  it(`will queue query when page if new page is created after bootstrap`, async () => {
    const service = getService({ isInBootstrap: false })
    const path = `/test`
    service.send({ type: `NEW_PAGE_CREATED`, path })
    // there is setTimeout in action handler for `NEW_PAGE_CREATED`
    await sleep()
    expect(runQueuedQueries).toBeCalledWith(path)
  })
})
