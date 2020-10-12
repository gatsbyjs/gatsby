import { IGatsbyState, ActionsUnion } from "../types"

type QueryID = string
type DependencyList = Set<string>

export const queryModuleDependenciesReducer = (
  state: IGatsbyState["queryModuleDependencies"] = {
    current: new Map<QueryID, DependencyList>(),
    previous: new Map<QueryID, DependencyList>(),
  },
  action: ActionsUnion
): IGatsbyState["queryModuleDependencies"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return {
        current: new Map<QueryID, DependencyList>(),
        previous: new Map<QueryID, DependencyList>(),
      }

    case `CREATE_MODULE_DEPENDENCY`: {
      let dependencyList = state.current.get(action.payload.path)
      if (!dependencyList) {
        dependencyList = new Set<string>()
        state.current.set(action.payload.path, dependencyList)
      }

      dependencyList.add(action.payload.moduleID)
      return state
    }

    case `DELETE_COMPONENTS_DEPENDENCIES`: {
      const { paths } = action.payload

      paths.forEach(path => {
        const currentModuleDeps = state.current.get(path)
        state.current.delete(path)
        if (currentModuleDeps) {
          state.previous.set(path, currentModuleDeps)
        } else {
          state.previous.set(path, new Set())
        }
      })

      return state
    }
  }
  return state
}
