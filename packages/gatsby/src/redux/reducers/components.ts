import normalize from "./normalize-path"
import { IGatsbyState, ActionsUnion } from "../types"

let programStatus = `BOOTSTRAPPING`

// TODO: replace usages of this reducer with queries.trackedComponents
//  It is here merely for compatibility.
export const componentsReducer = (
  state: IGatsbyState["components"] = new Map(),
  action: ActionsUnion
): IGatsbyState["components"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()
    case `SET_PROGRAM_STATUS`:
      programStatus = action.payload
      return state
    case `CREATE_PAGE`: {
      action.payload.componentPath = normalize(action.payload.component)
      // Create XState service.
      let component = state.get(action.payload.componentPath)
      if (!component) {
        component = {
          componentPath: action.payload.componentPath,
          componentChunkName: action.payload.componentChunkName,
          query: ``,
          pages: new Set(),
          isInBootstrap: true,
        }
      }
      component.pages.add(action.payload.path)
      component.isInBootstrap = programStatus === `BOOTSTRAPPING`
      state.set(action.payload.componentPath, component)
      return state
    }
    case `QUERY_EXTRACTED`: {
      action.payload.componentPath = normalize(action.payload.componentPath)
      const component = state.get(action.payload.componentPath)!
      component.query = action.payload.query
      state.set(action.payload.componentPath, component)
      return state
    }
    case `REMOVE_STATIC_QUERIES_BY_TEMPLATE`: {
      action.payload.componentPath = normalize(action.payload.componentPath)
      state.delete(action.payload.componentPath)
      return state
    }
    case `DELETE_PAGE`: {
      const component = state.get(normalize(action.payload.component))!
      component.pages.delete(action.payload.path)
      return state
    }
    case `SET_EXTRACTED_QUERIES`: {
      return action.payload.components
    }
  }

  return state
}
