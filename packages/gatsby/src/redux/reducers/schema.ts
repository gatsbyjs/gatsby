import { ActionsUnion, IGatsbyState } from "../types"
import { GraphQLSchema } from "graphql"

export const schemaReducer = (
  state: IGatsbyState["schema"] = new GraphQLSchema({ query: null }),
  action: ActionsUnion
): IGatsbyState["schema"] => {
  switch (action.type) {
    case `SET_SCHEMA`:
      return action.payload
    default:
      return state
  }
}
