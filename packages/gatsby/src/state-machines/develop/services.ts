import {
  IBuildContext,
  startWebpackServer,
  initialize,
  recompile,
  postBootstrap,
} from "../../services"
import {
  initializeDataMachine,
  reloadDataMachine,
  recreatePagesMachine,
} from "../data-layer"
import { queryRunningMachine } from "../query-running"
import { waitingMachine } from "../waiting"
import { ServiceConfig } from "xstate"

export const developServices: Record<string, ServiceConfig<IBuildContext>> = {
  initializeData: initializeDataMachine,
  reloadData: reloadDataMachine,
  recreatePages: recreatePagesMachine,
  initialize: initialize,
  runQueries: queryRunningMachine,
  waitForMutations: waitingMachine,
  startWebpackServer,
  recompile,
  postBootstrap,
}
