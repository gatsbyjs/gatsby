import { IRegisterModuleAction } from "../../types"

export const registerModuleInternal = ({
  moduleID,
  source,
  importName,
  type = `default`,
}: {
  moduleID: string
  source: string
  type: string
  importName?: string
}): IRegisterModuleAction => {
  return {
    type: `REGISTER_MODULE`,
    payload: {
      moduleID,
      source,
      type,
      importName,
    },
  }
}
