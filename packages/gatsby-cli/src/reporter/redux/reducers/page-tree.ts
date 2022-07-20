import { ActionsUnion } from "../types"
import { IRenderPageArgs } from "../../types"
import { Actions } from "../../constants"

export const reducer = (
  state: IRenderPageArgs | null = null,
  action: ActionsUnion
): IRenderPageArgs | null => {
  switch (action.type) {
    case Actions.RenderPageTree: {
      return action.payload
    }
  }

  return state
}
