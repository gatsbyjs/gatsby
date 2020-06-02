import { IGatsbyState, ActionsUnion } from "../types"

type QueryID = string
type DependencyList = Set<string>

export const queryModuleDependenciesReducer = (
  state: IGatsbyState["queryModuleDependencies"] = new Map<
    QueryID,
    DependencyList
  >(),
  action: ActionsUnion
): IGatsbyState["queryModuleDependencies"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map<QueryID, DependencyList>()

    case `CREATE_MODULE_DEPENDENCY`: {
      let dependencyList = state.get(action.payload.path)
      if (!dependencyList) {
        dependencyList = new Set<string>()
        state.set(action.payload.path, dependencyList)
      }

      dependencyList.add(action.payload.moduleID)
      return state
    }

    case `DELETE_COMPONENTS_DEPENDENCIES`: {
      const { paths } = action.payload

      paths.forEach(path => {
        state.delete(path)
      })

      return state
    }
  }
  return state
}
