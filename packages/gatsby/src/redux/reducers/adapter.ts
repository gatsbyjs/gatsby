import { noOpAdapterManager } from "../../utils/adapter/no-op-manager";
import type { ActionsUnion, IGatsbyState } from "../types";

export function adapterReducer(
  state: IGatsbyState["adapter"] | undefined = {
    instance: undefined,
    manager: noOpAdapterManager(),
    config: {
      excludeDatastoreFromEngineFunction: false,
      pluginsToDisable: [],
    },
  },
  action: ActionsUnion,
): IGatsbyState["adapter"] {
  switch (action.type) {
    case "SET_ADAPTER":
      return action.payload;
    default:
      return state;
  }
}
