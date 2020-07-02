const apiRunnerNode = require(`../api-runner-node`)

jest.mock(`../../redux`, () => {
  return {
    store: {
      getState: jest.fn(),
    },
    emitter: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }
})

const start = jest.fn()
const end = jest.fn()

const mockActivity = {
  start,
  end,
  done: end,
}

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    activityTimer: jest.fn(() => mockActivity),
    createProgress: jest.fn(() => mockActivity),
  }
})

const { store, emitter } = require(`../../redux`)

beforeEach(() => {
  store.getState.mockClear()
  emitter.on.mockClear()
  emitter.off.mockClear()
  emitter.emit.mockClear()
  mockActivity.start.mockClear()
  mockActivity.end.mockClear()
})

it(`Ends activities if plugin didn't end them`, async () => {
  jest.doMock(
    `test-plugin-correct/gatsby-node`,
    () => {
      return {
        testAPIHook: ({ reporter }) => {
          const spinnerActivity = reporter.activityTimer(
            `control spinner activity`
          )
          spinnerActivity.start()
          // calling activity.end() to make sure api runner doesn't call it more than needed
          spinnerActivity.end()

          const progressActivity = reporter.createProgress(
            `control progress activity`
          )
          progressActivity.start()
          // calling activity.done() to make sure api runner doesn't call it more than needed
          progressActivity.done()
        },
      }
    },
    { virtual: true }
  )
  jest.doMock(
    `test-plugin-spinner/gatsby-node`,
    () => {
      return {
        testAPIHook: ({ reporter }) => {
          const activity = reporter.activityTimer(`spinner activity`)
          activity.start()
          // not calling activity.end() - api runner should do end it
        },
      }
    },
    { virtual: true }
  )
  jest.doMock(
    `test-plugin-progress/gatsby-node`,
    () => {
      return {
        testAPIHook: ({ reporter }) => {
          const activity = reporter.createProgress(`spinner activity`, 100, 0)
          activity.start()
          // not calling activity.end() or done() - api runner should do end it
        },
      }
    },
    { virtual: true }
  )
  store.getState.mockImplementation(() => {
    return {
      program: {},
      config: {},
      flattenedPlugins: [
        {
          name: `test-plugin-correct`,
          resolve: `test-plugin-correct`,
          nodeAPIs: [`testAPIHook`],
        },
        {
          name: `test-plugin-spinner`,
          resolve: `test-plugin-spinner`,
          nodeAPIs: [`testAPIHook`],
        },
        {
          name: `test-plugin-progress`,
          resolve: `test-plugin-progress`,
          nodeAPIs: [`testAPIHook`],
        },
      ],
    }
  })
  await apiRunnerNode(`testAPIHook`)

  expect(mockActivity.start).toBeCalledTimes(4)
  // we called end same amount of times we called start, even tho plugins
  // didn't call end/done themselves
  expect(mockActivity.end).toBeCalledTimes(4)
})
