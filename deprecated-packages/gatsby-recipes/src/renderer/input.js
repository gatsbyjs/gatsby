// eslint-disable-next-line no-unused-vars
import React from "react"
import { useRecipeStep } from "./step-component"

function Input(props) {
  const step = useRecipeStep()

  return JSON.stringify({
    ...props,
    describe: props.label,
    _stepMetadata: { step: step.step },
  })
}

export default Input
