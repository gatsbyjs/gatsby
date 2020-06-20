import React from "react"
import { useRecipeStep } from "./step-component"

function Input(props) {
  const step = useRecipeStep()

  console.log(`input stuff`, { props })
  return JSON.stringify({
    ...props,
    describe: props.label,
    _stepMetadata: { step: step.step },
  })
}

export default Input
