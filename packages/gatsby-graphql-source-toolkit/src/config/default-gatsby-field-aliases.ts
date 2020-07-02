import { IGatsbyFieldAliases } from "../types"

export const defaultGatsbyFieldAliases: IGatsbyFieldAliases = {
  __typename: `remoteTypeName`,
  id: `remoteId`,
  internal: `remoteInternal`,
  children: `remoteChildren`,
  parent: `remoteParent`,
}
