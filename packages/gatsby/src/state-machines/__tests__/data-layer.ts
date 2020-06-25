/* eslint-disable no-unused-expressions */
import { dataLayerStates } from "./../data-layer"
import { Machine, interpret, Interpreter, State, EventObject } from "xstate"
import { IBuildContext } from "../../services"
jest.useFakeTimers()

export const INITIAL_CONTEXT: IBuildContext = {
  nodesMutatedDuringQueryRun: false,
  firstRun: true,
  nodeMutationBatch: [],
  runningBatch: [],
}

const actions = {
  callApi: jest.fn(),
  addNodeMutation: jest.fn(),
  markFilesDirty: jest.fn(),
  markNodesDirty: jest.fn(),
  writeCompilationHash: jest.fn(),
  spawnMutationListener: jest.fn(),
  assignChangedPages: jest.fn(),
  assignBootstrap: jest.fn(),
  resetGraphQlRunner: jest.fn(),
  assignGatsbyNodeGraphQL: jest.fn(),
}

const resolveSoon = <T = undefined>(returnValue?: T) => (): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(returnValue), 1))

const resolveUndefined = resolveSoon()

const services = {
  customizeSchema: jest.fn(resolveUndefined),
  sourceNodes: jest.fn(resolveUndefined),
  createPages: jest.fn(resolveUndefined),
  buildSchema: jest.fn(resolveUndefined),
  createPagesStatefully: jest.fn(resolveUndefined),
  extractQueries: jest.fn(resolveUndefined),
  writeOutRequires: jest.fn(resolveUndefined),
  calculateDirtyQueries: jest.fn(resolveUndefined),
  runStaticQueries: jest.fn(resolveUndefined),
  runPageQueries: jest.fn(resolveUndefined),
  initialize: jest.fn(resolveUndefined),
  writeHTML: jest.fn(resolveUndefined),
  waitUntilAllJobsComplete: jest.fn(resolveUndefined),
  postBootstrap: jest.fn(resolveUndefined),
  writeOutRedirects: jest.fn(resolveUndefined),
  startWebpackServer: jest.fn(resolveUndefined),
}

// eslint-disable-next-line new-cap
const machine = Machine(
  {
    id: `build`,
    initial: `running`,
    states: {
      running: {
        initial: `initializingDataLayer`,
        states: {
          initializingDataLayer: {
            id: `initializingDataLayer`,
            ...dataLayerStates,
          },
          extractingAndRunningQueries: {
            initial: `extractingQueries`,
            states: {
              extractingQueries: {
                id: `extracting-queries`,
                type: `final`,
              },
            },
          },
        },
      },
      waiting: {},
    },
  },
  {
    actions,
    services,
  }
)

describe(`the data layer state machine`, () => {
  let service: Interpreter<IBuildContext> | undefined
  const awaitNextEvent = (): Promise<EventObject> =>
    new Promise(resolve => {
      const handler = (event: EventObject): void => {
        service?.off(handler)
        resolve(event)
      }
      service?.onEvent(handler)
    })

  it(`runs through the happy path`, async () => {
    service = interpret(machine.withContext(INITIAL_CONTEXT))
    service?.start()

    // customizingSchema
    expect(service?.state.value).toMatchObject({
      running: { initializingDataLayer: `customizingSchema` },
    })

    expect(services.customizeSchema).toHaveBeenCalledWith(INITIAL_CONTEXT, {
      type: `xstate.init`,
    })

    jest.runAllTimers()
    await awaitNextEvent()

    //  sourcingNodes
    expect(service?.state.value).toMatchObject({
      running: { initializingDataLayer: `sourcingNodes` },
    })
    expect(services.sourceNodes).toHaveBeenCalledWith(
      INITIAL_CONTEXT,
      expect.objectContaining({
        type: `done.invoke.customizing-schema`,
      })
    )
    actions.assignChangedPages.mockClear()
    jest.runAllTimers()
    services.buildSchema.mockClear()
    await awaitNextEvent()
    expect(actions.assignChangedPages).toHaveBeenCalled()

    // buildingSchema

    expect(service?.state.value).toMatchObject({
      running: { initializingDataLayer: `buildingSchema` },
    })

    expect(services.buildSchema).toHaveBeenCalled()

    actions.assignGatsbyNodeGraphQL.mockClear()
    jest.runAllTimers()
    services.createPages.mockClear()
    await awaitNextEvent()

    expect(actions.assignGatsbyNodeGraphQL).toHaveBeenCalled()

    // creatingPages

    expect(service?.state.value).toMatchObject({
      running: { initializingDataLayer: `creatingPages` },
    })

    expect(services.createPages).toHaveBeenCalled()

    actions.assignChangedPages.mockClear()
    jest.runAllTimers()
    services.buildSchema.mockClear()
    await awaitNextEvent()
    expect(actions.assignChangedPages).toHaveBeenCalled()

    // creatingPagesStatefully

    expect(service?.state.value).toMatchObject({
      running: { initializingDataLayer: `creatingPagesStatefully` },
    })

    expect(services.createPagesStatefully).toHaveBeenCalled()

    actions.assignChangedPages.mockClear()
    jest.runAllTimers()
    services.buildSchema.mockClear()
    await awaitNextEvent()

    //  Done

    expect(service?.state.value).toMatchObject({
      running: { extractingAndRunningQueries: `extractingQueries` },
    })
  })
})
