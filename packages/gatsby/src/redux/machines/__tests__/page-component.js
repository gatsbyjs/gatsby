const { interpret } = require(`xstate`)
const machine = require(`../page-component`)

describe(`bootstrap`, () => {
  it(`handles not running queries during bootstrap`, () => {
    let service = interpret(
      machine.withContext({
        componentPath: `/a/path.js`,
        query: ``,
        pages: [`/`],
        isInBootstrap: true,
      })
    ).start()

    // Initial state
    expect(service.state.value).toEqual(`inactiveWhileBootstrapping`)

    // Query extracted
    service.send({ type: `QUERY_EXTRACTED`, query: `yo` })
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
    let service = interpret(
      machine.withContext({
        componentPath: `/a/path.js`,
        query: `yo`,
        pages: [`/`],
        isInBootstrap: false,
      })
    ).start()
    service.send(`QUERY_EXTRACTION_BABEL_ERROR`)
    expect(service.state.value).toEqual(`queryExtractionBabelError`)
    service.send(`QUERY_CHANGED`)
    expect(service.state.value).toEqual(`queryExtractionBabelError`)
  })
})
