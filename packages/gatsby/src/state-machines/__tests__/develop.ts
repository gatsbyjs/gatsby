import { developMachine } from "../develop"
import { interpret } from "xstate"
import { IProgram } from "../../commands/types"

const actions = {
  assignStoreAndWorkerPool: jest.fn(),
  markNodesDirty: jest.fn(),
  callApi: jest.fn(),
}

const services = {
  initialize: jest.fn(),
  initializeData: jest.fn(),
}

const machine = developMachine.withConfig(
  {
    actions,
    services,
  },
  {
    program: {} as IProgram,
  }
)

describe(`the develop state machine`, () => {
  it(`initialises`, async () => {
    const payload = { foo: 1 }
    const service = interpret(machine)
    const transitionWatcher = jest.fn()
    service.onTransition(transitionWatcher)
    service.start()
    expect(service.state.value).toBe(`initializing`)
    service.send(`done.invoke.initialize`)
    expect(service.state.value).toBe(`initializingData`)
    expect(actions.assignStoreAndWorkerPool).toHaveBeenCalled()
    service.send(`ADD_NODE_MUTATION`, payload)
    expect(actions.callApi).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ type: `ADD_NODE_MUTATION`, ...payload }),
      expect.anything()
    )

    expect(transitionWatcher).toHaveBeenCalledWith({})
  })
})
