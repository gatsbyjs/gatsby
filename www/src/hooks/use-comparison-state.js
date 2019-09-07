import React from "react"

export default function useComparisonState(initialState) {
  const setSelected = (state, selected) => {
    return { ...state, ...selected }
  }
  const [selected, dispatch] = React.useReducer(setSelected, initialState)

  let comparators = []
  let hasSelected = false
  for (const [key, value] of Object.entries(selected)) {
    if (value) {
      comparators.push(key)
      hasSelected = true
    }
  }

  return [selected, dispatch, comparators, hasSelected]
}
