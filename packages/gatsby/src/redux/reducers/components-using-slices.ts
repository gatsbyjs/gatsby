import type { ActionsUnion, IGatsbyState } from "../types";

export function componentsUsingSlicesReducer(
  state: IGatsbyState["componentsUsingSlices"] | undefined = new Map(),
  action: ActionsUnion,
): IGatsbyState["componentsUsingSlices"] {
  switch (action.type) {
    case "DELETE_CACHE":
      return new Map();
    case "SET_COMPONENTS_USING_PAGE_SLICES":
      return action.payload;
  }

  return state;
}
