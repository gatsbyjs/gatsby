import { bindActionCreators } from "redux"

import { store } from ".."

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

// Deprecated, remove in v3
export const boundActionCreators = bindActionCreators(actions, store.dispatch)

export const restrictedActionsAvailableInAPI = availableActionsByAPI

export { internalActions, publicActions, restrictedActions }
