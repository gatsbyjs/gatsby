const {
  warnAboutNodeManifestMappingProblems,
  processNodeManifests,
} = require(`../node-manifest`)

const getFakeReporter = (): {
  warn: jest.MockedFunction<(arg0: string) => string>
  info: jest.MockedFunction<(arg0: string) => string>
} => {
  return {
    warn: jest.fn(message => {
      console.warn(message)
      return message
    }),
    info: jest.fn(message => {
      console.info(message)
      return message
    }),
  }
}

describe(`warnAboutNodeManifestMappingProblems`, () => {
  it(`warns about no page found for manifest node id`, () => {
    const reporterFn = getFakeReporter()

    const { message, possibleMessages } = warnAboutNodeManifestMappingProblems(
      {
        inputManifest: {
          pluginName: `test`,
          node: { id: 1 },
          manifestId: 1,
        },
        pagePath: null,
        foundPageBy: `none`,
      },
      { reporterFn }
    )

    expect(reporterFn.warn.mock.calls.length).toBe(1)
    expect(reporterFn.warn.mock.results[0].value).toBe(possibleMessages.none)
    expect(message).toEqual(possibleMessages.none)
    expect(message.includes(`couldn't find a page for this node`)).toBeTruthy()
  })

  it(`warns about using context.id to map from node->page instead of ownerNodeId`, () => {
    const reporterFn = getFakeReporter()

    const { message, possibleMessages } = warnAboutNodeManifestMappingProblems(
      {
        inputManifest: {
          pluginName: `test`,
          node: { id: 1 },
          manifestId: 1,
        },
        pagePath: `/test`,
        foundPageBy: `context.id`,
      },
      { reporterFn }
    )

    expect(reporterFn.warn.mock.calls.length).toBe(1)
    expect(reporterFn.warn.mock.results[0].value).toBe(
      possibleMessages[`context.id`]
    )
    expect(message).toEqual(possibleMessages[`context.id`])
    expect(message.includes(`pageContext.id`)).toBeTruthy()
    expect(message.includes(`ownerNodeId`)).toBeTruthy()
  })

  it(`warns about using node->query tracking to map from node->page instead of using ownerNodeId`, () => {
    const reporterFn = getFakeReporter()

    const { message, possibleMessages } = warnAboutNodeManifestMappingProblems(
      {
        inputManifest: {
          pluginName: `test`,
          node: { id: 1 },
          manifestId: 1,
        },
        pagePath: `/test`,
        foundPageBy: `queryTracking`,
      },
      { reporterFn }
    )

    expect(reporterFn.warn.mock.calls.length).toBe(1)
    expect(reporterFn.warn.mock.results[0].value).toBe(
      possibleMessages[`queryTracking`]
    )
    expect(message).toEqual(possibleMessages[`queryTracking`])
    expect(
      message.includes(`the first page where this node is queried`)
    ).toBeTruthy()
  })

  it(`doesn't warn when using the filesystem route api to map nodes->pages`, () => {
    const reporterFn = getFakeReporter()
    const { message } = warnAboutNodeManifestMappingProblems(
      {
        inputManifest: {
          pluginName: `test`,
          node: { id: 1 },
          manifestId: 1,
        },
        pagePath: `/test`,
        foundPageBy: `filesystem-route-api`,
      },
      { reporterFn }
    )

    expect(reporterFn.warn.mock.calls.length).toBe(0)
    expect(message).toEqual(`success`)
  })

  it(`doesn't warn when using the filesystem route api to map nodes->pages`, () => {
    const reporterFn = getFakeReporter()
    const { message } = warnAboutNodeManifestMappingProblems(
      {
        inputManifest: {
          pluginName: `test`,
          node: { id: 1 },
          manifestId: 1,
        },
        pagePath: `/test`,
        foundPageBy: `ownerNodeId`,
      },
      { reporterFn }
    )

    expect(reporterFn.warn.mock.calls.length).toBe(0)
    expect(message).toEqual(`success`)
  })

  it(`warnings helper throws in impossible foundPageBy state`, () => {
    expect(() =>
      warnAboutNodeManifestMappingProblems({
        inputManifest: null,
        pagePath: null,
        foundPageBy: `nope`,
      })
    ).toThrow()
  })
})

describe(`processNodeManifests`, () => {
  it(`Doesn't do anything special when there are no pending manifests`, async () => {
    const storeDep = {
      getState: jest.fn(() => {
        return {
          nodeManifests: [],
        }
      }),
      dispatch: jest.fn(() => {}),
    }

    const internalActionsDep = {
      deleteNodeManifests: jest.fn(() => {}),
    }

    const processNodeManifestFn = jest.fn(() => {})
    const reporterFn = getFakeReporter()

    await processNodeManifests({
      storeDep,
      internalActionsDep,
      processNodeManifestFn,
      reporterFn,
    })

    expect(processNodeManifestFn.mock.calls.length).toBe(0)
    expect(internalActionsDep.deleteNodeManifests.mock.calls.length).toBe(0)
    expect(reporterFn.info.mock.calls.length).toBe(0)
    expect(storeDep.dispatch.mock.calls.length).toBe(0)
  })

  it(`accurately logs out how many manifest files were written to disk`, async () => {
    const storeDep = {
      getState: jest.fn(() => {
        return {
          nodeManifests: [{}, {}, {}],
        }
      }),
      dispatch: jest.fn(() => {}),
    }

    const internalActionsDep = {
      deleteNodeManifests: jest.fn(() => {}),
    }

    const processNodeManifestFn = jest.fn(() => {})
    const reporterFn = getFakeReporter()

    await processNodeManifests({
      storeDep,
      internalActionsDep,
      processNodeManifestFn,
      reporterFn,
    })

    expect(processNodeManifestFn.mock.calls.length).toBe(3)
    expect(reporterFn.info.mock.calls.length).toBe(1)
    expect(reporterFn.info.mock.results[0].value).toBe(
      `Wrote out 3 node page manifest files`
    )
    expect(storeDep.dispatch.mock.calls.length).toBe(1)
    expect(internalActionsDep.deleteNodeManifests.mock.calls.length).toBe(1)
  })
})
