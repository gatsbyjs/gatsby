import * as React from "react"
import { ErrorBoundary } from "./components/error-boundary"
import { ShadowPortal } from "../shadow-portal"
import { Style } from "./style"
import { BuildError } from "./components/build-error"
import { RuntimeErrors } from "./components/runtime-errors"
import { GraphqlErrors } from "./components/graphql-errors"
import { DevSsrError } from "./components/dev-ssr-error"

const reducer = (state, event) => {
  switch (event.action) {
    case `CLEAR_COMPILE_ERROR`: {
      return { ...state, buildError: null }
    }
    case `CLEAR_RUNTIME_ERRORS`: {
      return { ...state, errors: [] }
    }
    case `CLEAR_DEV_SSR_ERROR`: {
      return { ...state, devSsrError: null }
    }
    case `SHOW_COMPILE_ERROR`: {
      return { ...state, buildError: event.payload }
    }
    case `SHOW_DEV_SSR_ERROR`: {
      return { ...state, devSsrError: event.payload }
    }
    case `HANDLE_RUNTIME_ERROR`:
    case `SHOW_RUNTIME_ERRORS`: {
      return { ...state, errors: state.errors.concat(event.payload) }
    }
    case `SHOW_GRAPHQL_ERRORS`: {
      return {
        ...state,
        graphqlErrors: event.payload,
      }
    }
    case `CLEAR_GRAPHQL_ERRORS`: {
      return { ...state, graphqlErrors: [] }
    }
    case `DISMISS`: {
      return {
        ...state,
        buildError: null,
        errors: [],
        graphqlErrors: [],
      }
    }
    default: {
      return state
    }
  }
}

const initialState = {
  errors: [],
  buildError: null,
  devSsrError: null,
  graphqlErrors: [],
}

function DevOverlay({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  React.useEffect(() => {
    const gatsbyEvents = window._gatsbyEvents || []
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
    window._gatsbyEvents = []
  }

  const hasBuildError = state.buildError !== null
  const hasRuntimeErrors = Boolean(state.errors.length)
  const hasGraphqlErrors = Boolean(state.graphqlErrors.length)
  const hasDevSsrError = state.devSsrError !== null
  const hasErrors =
    hasBuildError || hasRuntimeErrors || hasGraphqlErrors || hasDevSsrError

  // This component has a deliberate order (priority)
  const ErrorComponent = () => {
    if (hasBuildError) {
      return <BuildError error={state.buildError} />
    }
    if (hasRuntimeErrors) {
      return <RuntimeErrors errors={state.errors} dismiss={dismiss} />
    }
    if (hasGraphqlErrors) {
      return <GraphqlErrors errors={state.graphqlErrors} dismiss={dismiss} />
    }
    if (hasDevSsrError) {
      return <DevSsrError error={state.devSsrError} />
    }

    return null
  }

  return (
    <React.Fragment>
      <ErrorBoundary hasErrors={hasErrors}>{children ?? null}</ErrorBoundary>
      {hasErrors ? (
        <ShadowPortal identifier="gatsby-fast-refresh">
          <Style />
          <ErrorComponent />
        </ShadowPortal>
      ) : undefined}
    </React.Fragment>
  )
}

export default DevOverlay
