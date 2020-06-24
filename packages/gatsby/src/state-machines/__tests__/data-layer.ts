import { dataLayerStates } from "./../data-layer"
import { Machine, interpret } from "xstate"

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
  assignGatsbyNodeGraphQl: jest.fn(),
}

const services = {
  customizeSchema: jest.fn(),
  sourceNodes: jest.fn(),
  createPages: jest.fn(),
  buildSchema: jest.fn(),
  createPagesStatefully: jest.fn(),
  extractQueries: jest.fn(),
  writeOutRequires: jest.fn(),
  calculateDirtyQueries: jest.fn(),
  runStaticQueries: jest.fn(),
  runPageQueries: jest.fn(),
  initialize: jest.fn(),
  writeHTML: jest.fn(),
  waitUntilAllJobsComplete: jest.fn(),
  postBootstrap: jest.fn(),
  writeOutRedirects: jest.fn(),
  startWebpackServer: jest.fn(),
}

// eslint-disable-next-line new-cap
const machine = Machine(dataLayerStates, {
  actions,
  services,
})

describe(`the data layer state machine`, () => {
  let service
  beforeEach(() => {
    service = interpret(machine)
  })
})
