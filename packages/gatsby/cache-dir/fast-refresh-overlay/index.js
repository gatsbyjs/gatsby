import React from "react"
import client from "webpack-hot-middleware/client"

import ErrorBoundary from "./components/error-boundary"
import Portal from "./components/portal"
import Style from "./components/style"
import BuildError from "./components/build-error"
import RuntimeError from "./components/runtime-error"

export default class FastRefreshOverlay extends React.Component {
  state = {
    errors: [],
    buildError: null,
    currentIndex: 0,
  }

  _isMounted = false

  dismiss = () => {
    // eslint-disable-next-line no-invalid-this
    this.setState({ errors: [], currenIndex: 0, buildError: null })
  }

  addBuildError = error => {
    // eslint-disable-next-line no-invalid-this
    this.setState({ buildError: error })
  }

  open = (file, lineNumber = 1) => {
    window.fetch(
      `/__open-stack-frame-in-editor?fileName=` +
        window.encodeURIComponent(file) +
        `&lineNumber=` +
        window.encodeURIComponent(lineNumber)
    )
  }

  componentDidMount() {
    this._isMounted = true

    client.useCustomOverlay({
      showProblems: (type, data) => {
        if (this._isMounted) {
          this.addBuildError(data[0])
        }
      },
      // We rely on Fast Refresh notifying us on updates as HMR notification is "not at the right time"
      clear: () => {
        this.setState({ buildError: null })
      },
    })

    // TODO: Maybe only do this? Investigate if third-party stuff should be visible

    // window.addEventListener(`error`, error => {
    //   setProblems(s =>
    //     s.concat({
    //       type: `RUNTIME_ERROR`,
    //       error,
    //     })
    //   )
    // })

    // TODO: Add e2e test case, e.g. useEffect in a component to fetch invalid URL

    // window.addEventListener(`unhandledrejection`, error => {
    //   setProblems(s =>
    //     s.concat({
    //       type: `RUNTIME_ERROR`,
    //       error: error.reason,
    //     })
    //   )
    // })
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    const { errors, currentIndex, buildError } = this.state
    const error = errors[currentIndex]
    const hasBuildError = buildError !== null
    const hasRuntimeError = Boolean(errors.length)

    const hasErrors = hasBuildError || hasRuntimeError

    return (
      <React.Fragment>
        <ErrorBoundary
          clearErrors={() => {
            this.setState({ errors: [], buildError: null })
          }}
          onError={error => {
            this.setState(prevState => {
              const insertedError = { type: `RUNTIME_ERROR`, error }
              return {
                errors: [...prevState.errors, insertedError],
              }
            })
          }}
        >
          {this.props.children ?? null}
        </ErrorBoundary>
        {hasErrors ? (
          <Portal>
            <Style />
            {hasBuildError ? (
              <BuildError
                error={buildError}
                open={this.open}
                dismiss={this.dismiss}
              />
            ) : hasRuntimeError ? (
              <RuntimeError
                error={error}
                open={this.open}
                dismiss={this.dismiss}
              />
            ) : undefined}
          </Portal>
        ) : undefined}
      </React.Fragment>
    )
  }
}
