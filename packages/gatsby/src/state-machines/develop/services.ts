import { IBuildContext, startWebpackServer, initialize } from "../../services"
import { dataLayerMachine } from "../data-layer"
import { queryRunningMachine } from "../query-running"
import { waitingMachine } from "../waiting"
import { ServiceConfig } from "xstate"

export const developServices: Record<string, ServiceConfig<IBuildContext>> = {
  initializeDataLayer: dataLayerMachine,
  initialize: initialize,
  runQueries: queryRunningMachine,
  waitForMutations: waitingMachine,
  startWebpackServer: startWebpackServer,
}
