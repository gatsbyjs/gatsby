import React, { useContext } from "react"
import { SlicesMapContext, SlicesResultsContext } from "./context"

export const InlineSlice = ({
  sliceName,
  allowEmpty,
  children,
  ...sliceProps
}) => {
  const slicesMap = useContext(SlicesMapContext)
  const slicesResultsMap = useContext(SlicesResultsContext)
  const concreteSliceName = slicesMap[sliceName]
  const slice = slicesResultsMap.get(concreteSliceName)

  if (!slice) {
    if (allowEmpty) {
      return null
    } else {
      throw new Error(
        `Slice "${concreteSliceName}" for "${sliceName}" slot not found`
      )
    }
  }

  if (typeof slice.component !== `function`) {
    throw new Error(
      `The slice component "${sliceName}" was not found. If your component is a named export, please use "export default" instead.`
    )
  }

  return (
    <slice.component
      sliceContext={slice.sliceContext}
      data={slice.data}
      {...sliceProps}
    >
      {children}
    </slice.component>
  )
}
