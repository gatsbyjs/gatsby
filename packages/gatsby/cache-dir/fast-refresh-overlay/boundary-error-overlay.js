import React, { useContext } from "react"
import { ErrorContext } from "."
import Overlay from "./components/overlay"

export default function RuntimeErrorOverlay() {
  const context = useContext(ErrorContext)
  const problem = context.problems[context.currentIndex]
  console.log(`1`, context)
  if (!problem) return null
  if (problem.type !== `BOUNDARY_ERROR`) return null

  return (
    <Overlay
      header={
        <p style={{ fontSize: `22px`, marginBottom: 0 }}>BOUNDARY Error</p>
      }
      body={<div>{}</div>}
    />
  )
}
