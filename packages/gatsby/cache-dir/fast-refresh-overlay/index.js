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

  addError = error => {
    // eslint-disable-next-line no-invalid-this
    this.setState(prevState => {
      return { errors: [...prevState.errors, error] }
    })
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
      clear: () => {
        const { errors } = this.state
        const hasRuntimeError = Boolean(errors.length)
        console.log(`clear here`)
        if (this._isMounted && !hasRuntimeError) {
          console.log(`I get run`)
          this.setState({ errors: [], currentIndex: 0, buildError: null })
        }
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
  //
  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   console.log({ prevProps, prevState })
  // }

  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    const { errors, currentIndex, buildError } = this.state
    const problem = errors[currentIndex]
    const hasBuildError = buildError !== null
    const hasRuntimeError = Boolean(errors.length)

    console.log({ errors, buildError })

    const hasErrors = hasBuildError || hasRuntimeError

    return (
      <React.Fragment>
        <ErrorBoundary
          style={{ filter: `blur(10px)` }}
          onError={error => {
            this.setState(prevState => {
              return {
                errors: [...prevState.errors, { type: `RUNTIME_ERROR`, error }],
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
              <RuntimeError problem={problem} dismiss={this.dismiss} />
            ) : undefined}
          </Portal>
        ) : undefined}
      </React.Fragment>
    )
  }
}
