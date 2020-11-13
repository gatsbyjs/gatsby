import React, { useLayoutEffect, useState } from "react"
import client from "webpack-hot-middleware/client"

import ErrorBoundary from "./components/error-boundary"
import BuildErrorOverlay from "./build-error-overlay"
import RuntimeErrorOverlay from "./runtime-error-overlay"
import BoundaryErrorOverlay from "./boundary-error-overlay"

export const ErrorContext = React.createContext({
  problems: [],
  currentIndex: 0,
  setCurrentIndex: () => void 0,
  dismiss: () => void 0,
})

export default function FastRefreshOverlay(props) {
  const [problems, setProblems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useLayoutEffect(() => {
    client.useCustomOverlay({
      showProblems(_, data) {
        setProblems(s =>
          s.concat({
            type: `BUILD_ERROR`,
            error: data[0],
          })
        )
      },
      clear() {
        setProblems([])
        setCurrentIndex(0)
      },
    })

    window.addEventListener(`error`, error => {
      setProblems(s =>
        s.concat({
          type: `RUNTIME_ERROR`,
          error,
        })
      )
    })

    window.addEventListener(`unhandledrejection`, error => {
      setProblems(s =>
        s.concat({
          type: `RUNTIME_ERROR`,
          error: error.reason,
        })
      )
    })

    return () => {
      console.log(`unmounting????`)
    }
  }, [])

  const dismiss = () => {
    setProblems([])
    setCurrentIndex(0)
  }

  const problem = problems[currentIndex]
  const hasBuildError = problem && problem.type === `BUILD_ERROR`

  if (problem) {
    console.log(problems)
  }

  return (
    <ErrorBoundary
      onError={error =>
        setProblems(s => s.concat({ type: `BOUNDARY_ERROR`, error }))
      }
    >
      <div style={{ filter: hasBuildError ? `blur(10px)` : `` }}>
        {props.children}
      </div>

      <ErrorContext.Provider
        value={{
          problems,
          currentIndex,
          setCurrentIndex: index => setCurrentIndex(index),
          dismiss,
        }}
      >
        <BoundaryErrorOverlay />
        <BuildErrorOverlay />
        <RuntimeErrorOverlay />
      </ErrorContext.Provider>
    </ErrorBoundary>
  )
}
