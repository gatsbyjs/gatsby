const mockFS = {
  existsSync: jest.fn(() => true),
}

jest.mock(`fs`, () => mockFS)
jest.mock(`fs-extra`, () => mockFS)

jest.mock(`path`, () => {
  return {
    isAbsolute: jest.fn(() => true),
  }
})

jest.mock(`../create-file-node`, () => {
  return {
    createFileNode: jest.fn(() => Promise.resolve({})),
  }
})

jest.mock(`chokidar`, () => {
  return {
    watch: jest.fn(),
  }
})

const chokidar = require(`chokidar`)
const { createFileNode } = require(`../create-file-node`)

const mitt = require(`mitt`)

const gatsbyNode = require(`../gatsby-node`)

const createApi = () => {
  return {
    actions: {
      createTypes: jest.fn(),
      createNode: jest.fn(),
      deleteNode: jest.fn(),
    },
    emitter: mitt(),
    createNodeId: jest.fn(),
    getNode: jest.fn(() => {
      // return truthy
      return {}
    }),
  }
}

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

describe(`tests`, () => {
  let on

  const emitChokidarEvent = async (eventType, ...args) => {
    const listenerSet = on.get(eventType)
    if (!listenerSet) {
      return
    }

    listenerSet.forEach(listener => {
      listener(...args)
    })
    await tick()
  }

  beforeEach(() => {
    on = new Map()
    chokidar.watch.mockImplementation(() => {
      const mock = {
        on: (eventType, listener) => {
          if (!on.has(eventType)) {
            on.set(eventType, new Set())
          }
          const listenerSet = on.get(eventType)
          listenerSet.add(listener)
        },
      }
      return mock
    })
    createFileNode.mockClear()
  })

  describe(`handles chokidar events emitted before "ready"`, () => {
    it(`queues node creation from added files`, async () => {
      const api = createApi()
      const sourceNodesPromise = gatsbyNode.sourceNodes(api, { path: `` })
      // allow microtasks execution
      await tick()

      await emitChokidarEvent(`add`, `test.md`)

      // ready was not emitted, so no nodes should be created
      expect(createFileNode).not.toBeCalled()
      expect(api.actions.createNode).not.toBeCalled()

      await emitChokidarEvent(`ready`)

      await expect(sourceNodesPromise).resolves.toBeDefined()

      expect(api.actions.createNode).toBeCalled()
    })

    // change event doesn't queue currently - this need to be fixed
    it.skip(`queues node creation from changed files`, async () => {
      const api = createApi()
      const sourceNodesPromise = gatsbyNode.sourceNodes(api, { path: `` })
      // allow microtasks execution
      await tick()

      await emitChokidarEvent(`change`, `test.md`)
      // ready was not emitted, so no nodes should be created
      expect(createFileNode).not.toBeCalled()
      expect(api.actions.createNode).not.toBeCalled()

      await emitChokidarEvent(`ready`)

      await expect(sourceNodesPromise).resolves.toBeDefined()

      expect(api.actions.createNode).toBeCalled()
    })

    it(`queues node creation from added directories`, async () => {
      const api = createApi()
      const sourceNodesPromise = gatsbyNode.sourceNodes(api, { path: `` })
      // allow microtasks execution
      await tick()

      await emitChokidarEvent(`addDir`, `test`)

      // ready was not emitted, so no nodes should be created
      expect(createFileNode).not.toBeCalled()
      expect(api.actions.createNode).not.toBeCalled()

      await emitChokidarEvent(`ready`)

      await expect(sourceNodesPromise).resolves.toBeDefined()

      expect(api.actions.createNode).toBeCalled()
    })

    // unlink event doesn't queue currently - this need to be fixed
    it.skip(`queues node deletion from deleted files`, async () => {
      const api = createApi()
      const sourceNodesPromise = gatsbyNode.sourceNodes(api, { path: `` })
      // allow microtasks execution
      await tick()

      await emitChokidarEvent(`unlink`, `test.md`)

      // ready was not emitted, so no nodes should be deleted
      expect(api.actions.deleteNode).not.toBeCalled()

      await emitChokidarEvent(`ready`)

      await expect(sourceNodesPromise).resolves.toBeDefined()

      expect(api.actions.deleteNode).toBeCalled()
    })

    // unlinkDir event doesn't queue currently - this need to be fixed
    it.skip(`queues node deletion from deleted directories`, async () => {
      const api = createApi()
      const sourceNodesPromise = gatsbyNode.sourceNodes(api, { path: `` })
      // allow microtasks execution
      await tick()

      await emitChokidarEvent(`unlinkDir`, `test`)

      // ready was not emitted, so no nodes should be deleted
      expect(api.actions.deleteNode).not.toBeCalled()

      await emitChokidarEvent(`ready`)

      await expect(sourceNodesPromise).resolves.toBeDefined()

      expect(api.actions.deleteNode).toBeCalled()
    })
  })

  describe(`handles chokidar events emitted after "ready"`, () => {
    it(`creates nodes from added files`, async () => {
      const api = createApi()
      const sourceNodesPromise = gatsbyNode.sourceNodes(api, { path: `` })
      // allow microtasks execution
      await tick()

      // ready was not emitted, so no nodes should be created
      expect(createFileNode).not.toBeCalled()
      expect(api.actions.createNode).not.toBeCalled()

      await emitChokidarEvent(`ready`)

      await expect(sourceNodesPromise).resolves.toBeDefined()

      await emitChokidarEvent(`add`, `test.md`)

      expect(api.actions.createNode).toBeCalled()
    })

    it(`creates nodes from changed files`, async () => {
      const api = createApi()
      const sourceNodesPromise = gatsbyNode.sourceNodes(api, { path: `` })
      // allow microtasks execution
      await tick()

      // ready was not emitted, so no nodes should be created
      expect(createFileNode).not.toBeCalled()
      expect(api.actions.createNode).not.toBeCalled()

      await emitChokidarEvent(`ready`)

      await expect(sourceNodesPromise).resolves.toBeDefined()

      await emitChokidarEvent(`change`, `test.md`)

      expect(api.actions.createNode).toBeCalled()
    })

    it(`creates nodes from added directories`, async () => {
      const api = createApi()
      const sourceNodesPromise = gatsbyNode.sourceNodes(api, { path: `` })
      // allow microtasks execution
      await tick()

      // ready was not emitted, so no nodes should be created
      expect(createFileNode).not.toBeCalled()
      expect(api.actions.createNode).not.toBeCalled()

      await emitChokidarEvent(`ready`)

      await expect(sourceNodesPromise).resolves.toBeDefined()

      await emitChokidarEvent(`addDir`, `test`)

      expect(api.actions.createNode).toBeCalled()
    })

    it(`delete nodes from deleted files`, async () => {
      const api = createApi()
      const sourceNodesPromise = gatsbyNode.sourceNodes(api, { path: `` })
      // allow microtasks execution
      await tick()

      // ready was not emitted, so no nodes should be deleted
      expect(api.actions.deleteNode).not.toBeCalled()

      await emitChokidarEvent(`ready`)

      await expect(sourceNodesPromise).resolves.toBeDefined()

      await emitChokidarEvent(`unlink`, `test.md`)

      expect(api.actions.deleteNode).toBeCalled()
    })

    it(`delete nodes from deleted directories`, async () => {
      const api = createApi()
      const sourceNodesPromise = gatsbyNode.sourceNodes(api, { path: `` })
      // allow microtasks execution
      await tick()

      // ready was not emitted, so no nodes should be deleted
      expect(api.actions.deleteNode).not.toBeCalled()

      await emitChokidarEvent(`ready`)

      await expect(sourceNodesPromise).resolves.toBeDefined()

      await emitChokidarEvent(`unlinkDir`, `test`)

      expect(api.actions.deleteNode).toBeCalled()
    })
  })
})
