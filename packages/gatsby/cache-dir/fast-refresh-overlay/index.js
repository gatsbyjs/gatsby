import React from "react"
import client from "webpack-hot-middleware/client"
import Anser from "anser"

import Overlay from "./components/overlay"
import ErrorBoundary from "./components/error-boundary"
import Portal from "./components/portal"
import Style from "./components/style"

function prettifyStack(errorInformation) {
  const txt = errorInformation.join(`\n`)
  return Anser.ansiToJson(txt, {
    remove_empty: true,
    use_classes: true,
    json: true,
  })
}

export default class FastRefreshOverlay extends React.Component {
  state = {
    problems: [],
    currentIndex: 0,
  }

  _isMounted = false

  dismiss = () => {
    // eslint-disable-next-line no-invalid-this
    this.setState({ problems: [], currenIndex: 0 })
  }

  addProblems = problem => {
    // eslint-disable-next-line no-invalid-this
    this.setState(prevState => {
      return { problems: [...prevState.problems, problem] }
    })
  }

  open = file => {
    console.log(
      `/__open-stack-frame-in-editor?fileName=` +
        window.encodeURIComponent(file)
    )
    window.fetch(
      `/__open-stack-frame-in-editor?fileName=` +
        window.encodeURIComponent(file)
    )
  }

  componentDidMount() {
    this._isMounted = true

    client.useCustomOverlay({
      showProblems: (_, data) => {
        if (this._isMounted) {
          this.addProblems({
            type: `BUILD_ERROR`,
            error: data[0],
          })
        }
      },
      clear: () => {
        if (this._isMounted) {
          this.setState({ problems: [], currentIndex: 0 })
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

  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    const { problems, currentIndex } = this.state
    const problem = problems[currentIndex]
    const hasBuildError = problem?.type === `BUILD_ERROR`
    const hasRuntimeError = problem?.type === `RUNTIME_ERROR`

    let header
    let body

    if (hasRuntimeError) {
      header = (
        <p data-gatsby-overlay="header__runtime-error">
          Unhandled Runtime Error
        </p>
      )
      body = <div>{problem.error.stack}</div>
    }

    if (hasBuildError) {
      const [file, cause, _a, ...rest] = problem.error.split(`\n`)
      const [_fullPath, _detailedError] = rest
      const detailedError = Anser.ansiToJson(_detailedError, {
        remove_empty: true,
        json: true,
      })
      console.log({ detailedError })
      const decoded = prettifyStack(rest)

      header = (
        <>
          <div data-gatsby-overlay="header__cause-file">
            <p>{cause}</p>
            <span>{file}</span>
          </div>
          <button
            onClick={() => this.open(file)}
            data-gatsby-overlay="header__open-in-editor"
          >
            Open in editor
          </button>
        </>
      )

      body = (
        <pre data-gatsby-overlay="pre">
          <code data-gatsby-overlay="pre__code">
            {decoded.map((entry, index) => (
              <span
                key={`frame-${index}`}
                data-gatsby-overlay="pre__code__span"
                style={{
                  color: entry.fg ? `var(--color-${entry.fg})` : undefined,
                  ...(entry.decoration === `bold`
                    ? { fontWeight: 800 }
                    : entry.decoration === `italic`
                    ? { fontStyle: `italic` }
                    : undefined),
                }}
              >
                {entry.content}
              </span>
            ))}
          </code>
        </pre>
      )
    }

    return (
      <React.Fragment>
        <ErrorBoundary
          style={{ filter: `blur(10px)` }}
          onError={error => {
            this.setState(prevState => {
              return {
                problems: [
                  ...prevState.problems,
                  { type: `RUNTIME_ERROR`, error },
                ],
              }
            })
          }}
        >
          {this.props.children ?? null}
        </ErrorBoundary>
        {this._isMounted ? (
          <Portal>
            <Style />
            {problem ? (
              <Overlay header={header} body={body} dismiss={this.dismiss} />
            ) : undefined}
          </Portal>
        ) : undefined}
      </React.Fragment>
    )
  }
}
