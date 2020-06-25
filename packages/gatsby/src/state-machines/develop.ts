import { Machine, AnyEventObject, MachineConfig } from "xstate"
import { IBuildContext } from "../services"
import { buildServices } from "../services"
import { buildActions } from "./actions"

export const INITIAL_CONTEXT: IBuildContext = {
  recursionCount: 0,
  nodesMutatedDuringQueryRun: false,
  firstRun: true,
  nodeMutationBatch: [],
  runningBatch: [],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const developConfig: MachineConfig<IBuildContext, any, AnyEventObject> = {
  id: `build`,
  initial: `setup`,
  context: INITIAL_CONTEXT,
  states: {
    setup: {
      on: {
        "": {
          actions: (): void => console.log(`init`),
        },
      },
    },
  },
}

// eslint-disable-next-line new-cap
export const developMachine = Machine<IBuildContext>(developConfig, {
  actions: buildActions,
  services: buildServices,
})
