import { ICreatePageModuleDependencyAction } from "../../types"

/**
 * Create a dependency between a page and module.
 * For internal use only.
 * @private
 */
export const addModuleDependencyToQueryResult = ({
  path,
  moduleID,
}: {
  path: string
  moduleID: string
}): ICreatePageModuleDependencyAction => {
  return {
    type: `CREATE_MODULE_DEPENDENCY`,
    payload: {
      path,
      moduleID,
    },
  }
}
