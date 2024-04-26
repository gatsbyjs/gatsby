import {
  type IBuildContext,
  startWebpackServer,
  initialize,
  recompile,
  postBootstrap,
  graphQLTypegen,
} from "../../services";
import {
  initializeDataMachine,
  reloadDataMachine,
  recreatePagesMachine,
} from "../data-layer";
import { queryRunningMachine } from "../query-running";
import { waitingMachine } from "../waiting";
import type { MachineOptions } from "xstate";

export const developServices: Exclude<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MachineOptions<IBuildContext, any>["services"],
  undefined
> = {
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
};
