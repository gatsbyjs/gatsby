import React, { useContext } from "react"
import { ErrorContext } from "./"
import Overlay from "./components/overlay"

export default function RuntimeErrorOverlay() {
  const context = useContext(ErrorContext)
  const problem = context.problems[context.currentIndex]
  if (!problem) return null
  if (problem.type !== `RUNTIME_ERROR`) return null

  return (
    <Overlay
      header={
        <p style={{ fontSize: `22px`, marginBottom: 0 }}>
          Unhandled Runtime Error
        </p>
      }
      body={<div>{problem.error.stack}</div>}
    />
  )
}
