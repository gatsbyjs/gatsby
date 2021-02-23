import * as React from "react"
import { ErrorBoundary } from "./components/error-boundary"
import { ShadowPortal } from "./components/portal"
import { Style } from "./style"
import { BuildError } from "./components/build-error"
import { RuntimeErrors } from "./components/runtime-errors"

const reducer = (state, event) => {
  switch (event.action) {
    case `CLEAR_COMPILE_ERROR`: {
      return { ...state, buildError: null }
    }
    case `CLEAR_RUNTIME_ERRORS`: {
      return { ...state, runtimeErrorIndex: 0, errors: [] }
    }
    case `SHOW_COMPILE_ERROR`: {
      return { ...state, buildError: event.payload }
    }
    case `HANDLE_RUNTIME_ERROR`:
    case `SHOW_RUNTIME_ERRORS`: {
      return { ...state, errors: event.payload }
    }
    case `DISMISS`: {
      return { ...state, runtimeErrorIndex: 0, buildError: null, errors: [] }
    }
    default: {
      return state
    }
  }
}

const initialState = {
  runtimeErrorIndex: 0,
  buildError: null,
  graphqlErrors: [],
  errors: [],
}

function DevOverlay({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  React.useEffect(() => {
    const gatsbyEvents = window._gatsbyEvents
    window._gatsbyEvents = {
      push: ([channel, event]) => {
        if (channel === `FAST_REFRESH`) {
          dispatch(event)
        }
      },
    }

    gatsbyEvents.forEach(([channel, event]) => {
      if (channel === `FAST_REFRESH`) {
        dispatch(event)
      }
    })
    return () => {
      window._gatsbyEvents = []
    }
  }, [dispatch])

  const dismiss = () => {
    dispatch({ action: `DISMISS` })
  }

  const hasBuildError = state.buildError !== null
  const hasRuntimeErrors = Boolean(state.errors.length)
  const hasErrors = hasBuildError || hasRuntimeErrors

  return (
    <React.Fragment>
      <ErrorBoundary hasErrors={hasErrors}>{children ?? null}</ErrorBoundary>
      {hasErrors ? (
        <ShadowPortal>
          <Style />
          {hasBuildError ? (
            <BuildError error={state.buildError} />
          ) : hasRuntimeErrors ? (
            <RuntimeErrors errors={state.errors} dismiss={dismiss} />
          ) : undefined}
        </ShadowPortal>
      ) : undefined}
    </React.Fragment>
  )
}

export default DevOverlay
