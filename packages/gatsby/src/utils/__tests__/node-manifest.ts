import { foundPageByToLogIds } from "./../node-manifest"
import path from "path"
import fs from "fs-extra"
import reporter from "gatsby-cli/lib/reporter"
import { store } from "../../redux"
import { actions } from "../../redux/actions"
import { getNode } from "../../datastore"

import { INodeManifest } from "./../../redux/types"

import {
  warnAboutNodeManifestMappingProblems,
  processNodeManifests,
} from "../node-manifest"

function itWindows(name: string, fn: () => void): void {
  return process.platform === `win32` ? it(name, fn) : xit(name, fn)
}

jest.mock(`fs-extra`, () => {
  return {
    ensureDir: jest.fn(),
    writeJSON: jest.fn((manifestFilePath, finalManifest) => {
      if (process.env.DEBUG) {
        console.log({ manifestFilePath, finalManifest })
      }
      return new Promise(resolve =>
        resolve({
          manifestFilePath,
          finalManifest,
        })
      )
    }),
  }
})

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    error: jest.fn(input => {
      if (process.env.DEBUG) {
        console.error(JSON.stringify(input, null, 2))
      }
      return input
    }),
    warn: jest.fn(message => {
      if (process.env.DEBUG) {
        console.warn(message)
      }
      return message
    }),
    info: jest.fn(message => {
      if (process.env.DEBUG) {
        console.info(message)
      }
      return message
    }),
  }
})

jest.mock(`../../datastore`, () => {
  return {
    getNode: jest.fn(),
  }
})

const storeState = {
  nodeManifests: [],
  nodes: new Map(),
  pages: new Map(),
  program: {
    directory: process.cwd(),
  },
  queries: { byNode: new Map() },
}

jest.mock(`../../redux`, () => {
  return {
    emitter: {
      on: jest.fn(),
    },
    store: {
      getState: jest.fn(),
      dispatch: jest.fn(),
    },
  }
})

function mockGetNodes(nodeStore: Map<string, { id: string }>): void {
  getNode.mockImplementation(id => nodeStore.get(id))
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env.gatsby_log_level = null
})

describe(`processNodeManifests() warnings`, () => {
  const useContextIdInsteadOfOwnerNodeId = {
    pages: new Map([
      [
        `/test`,
        {
          path: `/test`,
          context: { id: `1` },
        },
      ],
      [
        `/test-2`,
        {
          path: `/test-2`,
          context: { id: `2` },
        },
      ],
    ]),
    nodeManifests: [
      {
        pluginName: `test`,
        node: { id: `1` },
        manifestId: `1`,
      },
    ],
    queries: {
      byNode: new Map([
        [`1`, new Set([`/test`, `/test-2`])],
        [`2`, new Set([`/test`, `/test-2`])],
      ]),
    },
  }

  const multipleMappingProblems = {
    pages: new Map([
      [
        `/test`,
        {
          path: `/test`,
          context: { id: `1` },
        },
      ],
    ]),
    nodeManifests: [
      {
        pluginName: `test`,
        node: { id: `1` },
        manifestId: `1`,
      },
      {
        pluginName: `test`,
        node: { id: `2` },
        manifestId: `2`,
      },
    ],
  }

  it(`logs warning code for not finding page`, async () => {
    mockGetNodes(new Map([[`1`, { id: `1` }]]))

    store.getState.mockImplementation(() => {
      return {
        ...storeState,
        nodeManifests: [
          {
            pluginName: `test`,
            node: { id: `1` },
            manifestId: `1`,
          },
        ],
      }
    })

    await processNodeManifests()

    expect(reporter.error).not.toBeCalled()
    expect(reporter.info).toBeCalledWith(
      expect.stringContaining(
        `unstable_createNodeManifest produced warnings [${foundPageByToLogIds.none}]`
      )
    )
  })

  it(`logs warning code for finding page with context.id instead of ownerNodeId`, async () => {
    mockGetNodes(
      new Map([
        [`1`, { id: `1` }],
        [`2`, { id: `2` }],
      ])
    )
    store.getState.mockImplementation(() => {
      return {
        ...storeState,
        ...useContextIdInsteadOfOwnerNodeId,
      }
    })

    // first as develop
    process.env.NODE_ENV = `development`

    await processNodeManifests()

    expect(reporter.error).not.toBeCalled()
    expect(reporter.info).toBeCalledWith(
      expect.stringContaining(
        `unstable_createNodeManifest produced warnings [${
          foundPageByToLogIds[`context.id`]
        }]`
      )
    )
  })

  it(`logs out list of warning codes for multiple mapping errors`, async () => {
    mockGetNodes(
      new Map([
        [`1`, { id: `1` }],
        [`2`, { id: `2` }],
      ])
    )
    store.getState.mockImplementation(() => {
      return {
        ...storeState,
        ...multipleMappingProblems,
      }
    })

    // first as develop
    process.env.NODE_ENV = `development`

    await processNodeManifests()

    expect(reporter.error).not.toBeCalled()
    expect(reporter.info).toBeCalledWith(
      expect.stringContaining(foundPageByToLogIds.none)
    )
    expect(reporter.info).toBeCalledWith(
      expect.stringContaining(foundPageByToLogIds[`context.id`])
    )
  })

  describe(`Verbose mode`, () => {
    beforeEach(() => {
      process.env.gatsby_log_level = `verbose`
    })

    it(`warns about no page found for manifest node id`, async () => {
      mockGetNodes(new Map([[`1`, { id: `1` }]]))

      store.getState.mockImplementation(() => {
        return {
          ...storeState,
          nodeManifests: [
            {
              pluginName: `test`,
              node: { id: `1` },
              manifestId: `1`,
            },
          ],
        }
      })

      await processNodeManifests()

      expect(reporter.error).toBeCalled()
      expect(reporter.error).toBeCalledWith(
        expect.objectContaining({ id: foundPageByToLogIds.none })
      )
    })

    it(`warns about using context.id to map from node->page instead of ownerNodeId`, async () => {
      mockGetNodes(
        new Map([
          [`1`, { id: `1` }],
          [`2`, { id: `2` }],
        ])
      )
      store.getState.mockImplementation(() => {
        return {
          ...storeState,
          ...useContextIdInsteadOfOwnerNodeId,
        }
      })

      // first as develop
      process.env.NODE_ENV = `development`

      await processNodeManifests()

      expect(reporter.error).toBeCalled()
      expect(reporter.error).toBeCalledWith(
        expect.objectContaining({
          id: foundPageByToLogIds[`context.id`],
        })
      )

      // then as build
      process.env.NODE_ENV = `production`

      await processNodeManifests()

      expect(reporter.error).toBeCalled()
      expect(reporter.error).toBeCalledWith(
        expect.objectContaining({
          id: foundPageByToLogIds[`context.id`],
        })
      )
      process.env.NODE_ENV = `test`
    })

    it(`warns about using node->query tracking to map from node->page instead of using ownerNodeId`, async () => {
      mockGetNodes(new Map([[`1`, { id: `1` }]]))
      store.getState.mockImplementation(() => {
        return {
          ...storeState,
          pages: new Map([
            [
              `/test`,
              {
                path: `/test`,
                context: {},
              },
            ],
          ]),
          nodeManifests: [
            {
              pluginName: `test`,
              node: { id: `1` },
              manifestId: `1`,
            },
          ],
          queries: {
            byNode: new Map([[`1`, new Set([`/test`])]]),
          },
        }
      })

      await processNodeManifests()

      expect(reporter.error).toBeCalled()
      expect(reporter.error).toBeCalledWith(
        expect.objectContaining({
          id: foundPageByToLogIds.queryTracking,
        })
      )
    })

    it(`doesn't warn when using the filesystem route api to map nodes->pages`, () => {
      const { logId } = warnAboutNodeManifestMappingProblems({
        inputManifest: {
          pluginName: `test`,
          node: { id: `1` },
          manifestId: `1`,
        },
        pagePath: `/test`,
        foundPageBy: `filesystem-route-api`,
        verbose: process.env.gatsby_log_level === `verbose`,
      })

      expect(reporter.error).not.toBeCalled()
      expect(logId).toEqual(foundPageByToLogIds[`filesystem-route-api`])
    })
  })
})

describe(`processNodeManifests`, () => {
  it(`Doesn't do anything when there are no pending manifests`, async () => {
    store.getState.mockImplementation(() => storeState)

    await processNodeManifests()

    expect(fs.writeJSON).not.toBeCalled()
    expect(reporter.info).not.toBeCalled()
    expect(reporter.warn).not.toBeCalled()
    expect(reporter.error).not.toBeCalled()
    expect(store.dispatch).not.toBeCalled()
  })

  const testProcessNodeManifestsWithUpdatedAt = async (): Promise<void> => {
    const today = new Date()
    const twentyNineDaysAgoString = new Date(
      new Date().setDate(today.getDate() - 29)
    ).toISOString()
    const thirtyOneDaysAgoString = new Date(
      new Date().setDate(today.getDate() - 31)
    ).toISOString()

    const nodes = [
      { id: `1`, usePageContextId: true, updatedAt: today.toISOString() },
      { id: `2`, useOwnerNodeId: true, updatedAt: twentyNineDaysAgoString },
      { id: `3`, useQueryTracking: true, updatedAt: thirtyOneDaysAgoString },
    ]
    const { store } = jest.requireActual(`../../redux`)

    const createPayload = (
      id,
      updatedAtUTC
    ): {
      manifestId: string
      node: { id: string }
      updatedAtUTC: string
    } => {
      return {
        manifestId: `${id}-${updatedAtUTC}`,
        node: {
          id,
        },
        updatedAtUTC,
      }
    }

    // Doesn't process manifest that is 31 days old
    nodes.forEach(node => {
      const payload = createPayload(node.id, node.updatedAt)
      store.dispatch(
        actions.unstable_createNodeManifest(payload, {
          name: `gatsby-source-test`,
        })
      )
    })

    const { nodeManifests } = store.getState()

    process.env.NODE_MANIFEST_MAX_DAYS_OLD = `32`

    // Processes all three manifests
    nodes.forEach(node => {
      const payload = createPayload(node.id, node.updatedAt)
      store.dispatch(
        actions.unstable_createNodeManifest(payload, {
          name: `gatsby-source-test`,
        })
      )
    })

    process.env.NODE_MANIFEST_MAX_DAYS_OLD = null

    expect(nodeManifests.length).toBe(5)
  }

  const testProcessNodeManifests = async (): Promise<void> => {
    const nodes = [
      { id: `1`, usePageContextId: true },
      { id: `2`, useOwnerNodeId: true },
      { id: `3`, useQueryTracking: true },
    ]
    mockGetNodes(
      new Map(nodes.map(node => [`${node.id}`, { id: `${node.id}` }]))
    )

    const pendingManifests: Array<INodeManifest> = [
      ...nodes,
      {
        // this node doesn't exist
        id: `4`,
      },
    ].map(node => {
      return {
        pluginName: `test`,
        manifestId: `${node.id}`,
        node,
      }
    })

    store.getState.mockImplementation(() => {
      return {
        ...storeState,
        pages: new Map(
          nodes.map(node => [
            `/${node.id}`,
            {
              path: `/${node.id}`,
              ownerNodeId: node.useOwnerNodeId ? node.id : null,
              context: {
                id: node.usePageContextId ? node.id : null,
              },
            },
          ])
        ),
        nodeManifests: pendingManifests,
        queries: {
          byNode: new Map(
            nodes.map(node => [`${node.id}`, new Set([`/${node.id}`])])
          ),
        },
      }
    })

    await processNodeManifests()

    if (process.env.gatsby_log_level === `verbose`) {
      expect(reporter.error).toBeCalled()
      expect(reporter.error).toBeCalledWith({
        context: { nodeId: `4`, pluginName: `test` },
        id: `11804`,
      })
    } else {
      expect(reporter.error).not.toBeCalled()
      expect(reporter.info).toBeCalledWith(expect.stringContaining(`11804`))
    }

    expect(reporter.info).toBeCalled()
    expect(reporter.info).toBeCalledWith(
      expect.stringContaining(
        `Wrote out ${nodes.length} node page manifest files`
      )
    )
    expect(reporter.info).toBeCalledWith(
      expect.stringContaining(`1 manifest couldn't be processed`)
    )
    expect(store.dispatch).toBeCalled()

    expect(fs.ensureDir).toBeCalledTimes(nodes.length)
    expect(fs.writeJSON).toBeCalledTimes(nodes.length)

    pendingManifests.forEach((manifest, index) => {
      // if a node doesn't exist for this manifest we don't want to assert that
      // a manifest was written
      if (!nodes.find(node => node.id === manifest.node.id)) {
        return
      }

      expect(fs.writeJSON).toHaveBeenNthCalledWith(
        index + 1,
        `${path.join(
          process.cwd(),
          `public`,
          `__node-manifests`,
          `test`,
          manifest.manifestId
        )}.json`,
        expect.objectContaining({
          page: {
            path: `/${manifest.node.id}`,
          },
        })
      )
    })
  }

  it(`processes node manifests gatsby develop`, async () => {
    process.env.NODE_ENV = `development`
    await testProcessNodeManifests()
    process.env.NODE_ENV = `test`
  })

  it(`processes node manifests gatsby build`, async () => {
    process.env.NODE_ENV = `production`
    process.env.gatsby_log_level = `verbose`
    await testProcessNodeManifests()
    process.env.NODE_ENV = `test`
  })

  it(`creates manifests only for recently updated manifests`, async () => {
    process.env.NODE_ENV = `production`
    await testProcessNodeManifestsWithUpdatedAt()
    process.env.NODE_ENV = `test`
  })
  itWindows(`replaces reserved Windows characters with a dash`, async () => {
    const nodes = [
      { id: `1`, usePageContextId: true },
      { id: `2`, useOwnerNodeId: true },
      { id: `3`, useQueryTracking: true },
    ]
    mockGetNodes(
      new Map(nodes.map(node => [`${node.id}`, { id: `${node.id}` }]))
    )

    store.getState.mockImplementation(() => {
      return {
        ...storeState,
        pages: new Map([
          [
            `/test`,
            {
              path: `/test`,
              context: { id: `1` },
            },
          ],
          [
            `/test-2`,
            {
              path: `/test-2`,
              context: { id: `2` },
            },
          ],
        ]),
        nodeManifests: [
          {
            pluginName: `test`,
            node: { id: `1` },
            // A manifest id containing all of the reserved windows characters that we check
            // for and replace
            manifestId: `\\*"<>/:?|`,
          },
        ],
        queries: {
          byNode: new Map([
            [`1`, new Set([`/test`, `/test-2`])],
            [`2`, new Set([`/test`, `/test-2`])],
          ]),
        },
      }
    })

    await processNodeManifests()
    const nodeManifestFileName = path.basename(fs.writeJSON.mock.calls[0][0])

    expect(nodeManifestFileName).toEqual(`---------.json`)
  })
})
