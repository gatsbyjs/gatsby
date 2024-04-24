import type { ActionsUnion } from "../types";
import type { IRenderPageArgs } from "../../types";
import { Actions } from "../../constants";

export function reducer(
  state: IRenderPageArgs | null | undefined = null,
  action: ActionsUnion,
): IRenderPageArgs | null {
  switch (action.type) {
    case Actions.RenderPageTree: {
      return action.payload;
    }
  }

  return state;
}
