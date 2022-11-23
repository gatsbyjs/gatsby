import * as internalActions from "./internal"
import { actions as publicActions } from "./public"
import {
  actions as restrictedActions,
  availableActionsByAPI,
} from "./restricted"

export const actions = {
  ...internalActions,
  ...publicActions,
  ...restrictedActions,
}

export const restrictedActionsAvailableInAPI = availableActionsByAPI

export { internalActions, publicActions, restrictedActions }
