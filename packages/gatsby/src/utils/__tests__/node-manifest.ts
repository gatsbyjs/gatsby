import path from "path"
import reporter from "gatsby-cli/lib/reporter"
import { INodeManifest } from "./../../redux/types"
import {
  warnAboutNodeManifestMappingProblems,
  processNodeManifests,
  processNodeManifest,
} from "../node-manifest"

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    warn: jest.fn(message => message),
    info: jest.fn(message => message),
  }
})

describe(`warnAboutNodeManifestMappingProblems`, () => {
  afterEach(() => {
    reporter.warn.mockReset()
  })

  it(`warns about no page found for manifest node id`, () => {
    const { message, possibleMessages } = warnAboutNodeManifestMappingProblems({
      inputManifest: {
        pluginName: `test`,
        node: { id: `1` },
        manifestId: `1`,
      },
      pagePath: undefined,
      foundPageBy: `none`,
    })

    expect(reporter.warn).toBeCalled()
    expect(reporter.warn).toBeCalledWith(possibleMessages.none)
    expect(message).toEqual(possibleMessages.none)
    expect(message.includes(`couldn't find a page for this node`)).toBeTruthy()
  })

  it(`warns about using context.id to map from node->page instead of ownerNodeId`, () => {
    const { message, possibleMessages } = warnAboutNodeManifestMappingProblems({
      inputManifest: {
        pluginName: `test`,
        node: { id: `1` },
        manifestId: `1`,
      },
      pagePath: `/test`,
      foundPageBy: `context.id`,
    })

    expect(reporter.warn).toBeCalled()
    expect(reporter.warn).toBeCalledWith(possibleMessages[`context.id`])
    expect(message).toEqual(possibleMessages[`context.id`])
    expect(message.includes(`pageContext.id`)).toBeTruthy()
    expect(message.includes(`ownerNodeId`)).toBeTruthy()
  })

  it(`warns about using node->query tracking to map from node->page instead of using ownerNodeId`, () => {
    const { message, possibleMessages } = warnAboutNodeManifestMappingProblems({
      inputManifest: {
        pluginName: `test`,
        node: { id: `1` },
        manifestId: `1`,
      },
      pagePath: `/test`,
      foundPageBy: `queryTracking`,
    })

    expect(reporter.warn).toBeCalled()
    expect(reporter.warn).toBeCalledWith(possibleMessages[`queryTracking`])
    expect(message).toEqual(possibleMessages[`queryTracking`])
    expect(
      message.includes(`the first page where this node is queried`)
    ).toBeTruthy()
  })

  it(`doesn't warn when using the filesystem route api to map nodes->pages`, () => {
    const { message } = warnAboutNodeManifestMappingProblems({
      inputManifest: {
        pluginName: `test`,
        node: { id: `1` },
        manifestId: `1`,
      },
      pagePath: `/test`,
      foundPageBy: `filesystem-route-api`,
    })

    expect(reporter.warn).not.toBeCalled()
    expect(message).toEqual(`success`)
  })

  it(`doesn't warn when using the filesystem route api to map nodes->pages`, () => {
    const { message } = warnAboutNodeManifestMappingProblems({
      inputManifest: {
        pluginName: `test`,
        node: { id: `1` },
        manifestId: `1`,
      },
      pagePath: `/test`,
      foundPageBy: `ownerNodeId`,
    })

    expect(reporter.warn).not.toBeCalled()
    expect(message).toEqual(`success`)
  })

  it(`warnings helper throws in impossible foundPageBy state`, () => {
    expect(() =>
      warnAboutNodeManifestMappingProblems({
        pagePath: undefined,
        // @ts-ignore: intentionally doing the wrong thing here
        inputManifest: null,
        // @ts-ignore: intentionally doing the wrong thing here
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
      dispatch: jest.fn(),
    }

    const internalActionsDep = {
      deleteNodeManifests: jest.fn(),
    }

    const processNodeManifestFn = jest.fn()

    await processNodeManifests({
      storeDep,
      internalActionsDep,
      processNodeManifestFn,
    })

    expect(processNodeManifestFn.mock.calls.length).toBe(0)
    expect(internalActionsDep.deleteNodeManifests.mock.calls.length).toBe(0)
    expect(reporter.info).not.toBeCalled()
    expect(storeDep.dispatch.mock.calls.length).toBe(0)
  })

  it(`accurately logs out how many manifest files were written to disk`, async () => {
    const storeDep = {
      getState: jest.fn(() => {
        return {
          nodeManifests: [{}, {}, {}],
        }
      }),
      dispatch: jest.fn(),
    }

    const internalActionsDep = {
      deleteNodeManifests: jest.fn(),
    }

    const processNodeManifestFn = jest.fn()

    await processNodeManifests({
      storeDep,
      internalActionsDep,
      processNodeManifestFn,
    })

    expect(processNodeManifestFn.mock.calls.length).toBe(3)
    expect(reporter.info).toBeCalled()
    expect(reporter.info).toBeCalledWith(`Wrote out 3 node page manifest files`)
    expect(storeDep.dispatch.mock.calls.length).toBe(1)
    expect(internalActionsDep.deleteNodeManifests.mock.calls.length).toBe(1)
  })
})

describe(`processNodeManifest`, () => {
  it(`processes node manifests`, async () => {
    const nodes = [{ id: `1` }, { id: `2` }, { id: `3` }]

    const pendingManifests: Array<INodeManifest> = [
      {
        pluginName: `test`,
        manifestId: `1`,
        node: { id: `1` },
      },
      {
        pluginName: `test`,
        manifestId: `2`,
        node: { id: `2` },
      },
      {
        pluginName: `test`,
        manifestId: `3`,
        node: { id: `3` },
      },
      {
        pluginName: `test`,
        manifestId: `4`,
        node: { id: `4` },
      },
    ]

    const fsFn = {
      ensureDir: jest.fn(),
      writeJSON: jest.fn((manifestFilePath, finalManifest) => {
        return { manifestFilePath, finalManifest }
      }),
    }

    const getNode = (nodeId: string): { id: string } | undefined =>
      nodes.find(({ id }) => nodeId === id)

    const getNodeFn = jest.fn(getNode)

    const findPageOwnedByNodeIdFn = jest.fn(({ nodeId }) => {
      return {
        page: {
          path: `/${nodeId}`,
        },
        foundPageBy: `pageContext.id`,
      }
    })

    const warnAboutNodeManifestMappingProblemsFn = jest.fn()

    await Promise.all(
      pendingManifests.map(manifest =>
        processNodeManifest(manifest, {
          fsFn,
          findPageOwnedByNodeIdFn,
          warnAboutNodeManifestMappingProblemsFn,
          getNodeFn,
        })
      )
    )

    expect(reporter.warn).toBeCalled()
    expect(reporter.warn).toBeCalledWith(
      `Plugin test called unstable_createNodeManifest for a node which doesn't exist with an id of 4.`
    )

    expect(warnAboutNodeManifestMappingProblemsFn.mock.calls.length).toBe(
      nodes.length
    )
    expect(findPageOwnedByNodeIdFn.mock.calls.length).toBe(nodes.length)

    expect(fsFn.ensureDir.mock.calls.length).toBe(nodes.length)
    expect(fsFn.writeJSON.mock.calls.length).toBe(nodes.length)

    pendingManifests.forEach((manifest, index) => {
      if (!getNode(manifest.node.id)) {
        return
      }

      const jsonResults = fsFn.writeJSON.mock.results[index].value

      expect(jsonResults.manifestFilePath).toBe(
        `${path.join(process.cwd(), `.cache`, `node-manifests`, `test`)}/${
          manifest.manifestId
        }.json`
      )

      expect(jsonResults.finalManifest.page.path).toBe(`/${manifest.node.id}`)
    })
  })
})
