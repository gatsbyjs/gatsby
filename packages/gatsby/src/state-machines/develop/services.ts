import {
  IBuildContext,
  startWebpackServer,
  initialize,
  recompile,
  postBootstrap,
  graphQLTypegen,
} from "../../services"
import {
  initializeDataMachine,
  reloadDataMachine,
  recreatePagesMachine,
} from "../data-layer"
import { queryRunningMachine } from "../query-running"
import { waitingMachine } from "../waiting"
import { MachineOptions } from "xstate"

export const developServices: MachineOptions<IBuildContext, any>["services"] = {
  initializeData: initializeDataMachine,
  reloadData: reloadDataMachine,
  recreatePages: recreatePagesMachine,
  initialize: initialize,
  runQueries: queryRunningMachine,
  waitForMutations: waitingMachine,
  startWebpackServer,
  recompile,
  postBootstrap,
  graphQLTypegen,
}
