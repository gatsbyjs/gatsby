const { warnAboutNodeManifestMappingProblems } = require(`../node-manifest`)

const getFakeReporter = (): {
  warn: jest.MockedFunction<(arg0: string) => string>
} => {
  return {
    warn: jest.fn(message => {
      console.warn(message)
      return message
    }),
  }
}

describe(`Node Manifests utils`, () => {
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
