import React from "react"
import client from "webpack-hot-middleware/client"
import ansiHTML from "ansi-html"

import Overlay from "./overlay"

const styles = {
  button: {
    alignItems: `center`,
    borderRadius: `4px`,
    justifyContent: `center`,
    lineHeight: 1,
    cursor: `pointer`,
    color: `#fff`,
    border: `1px solid rgb(102, 51, 153)`,
    background: `#9158ca`,
    fontWeight: 600,
    fontSize: `0.875rem`,
    height: `2rem`,
    minWidth: `2rem`,
    padding: `0.25rem 0.75rem`,
  },
}

function prettifyStack(errorInformation) {
  console.log(errorInformation)
  return ansiHTML(errorInformation.join(`\n`))
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

  componentDidCatch(error) {
    this.setState(prevState => {
      return {
        problems: [...prevState.problems, { type: `RUNTIME_ERROR`, error }],
      }
    })
  }

  render() {
    const { problems, currentIndex } = this.state
    const problem = problems[currentIndex]
    const hasBuildError = problem?.type === `BUILD_ERROR`
    const hasRuntimeError = problem?.type === `RUNTIME_ERROR`

    console.log({ problem, currentIndex })

    let header
    let body

    if (hasRuntimeError) {
      header = (
        <p style={{ fontSize: `22px`, marginBottom: 0 }}>
          Unhandled Runtime Error
        </p>
      )
      body = <div>{problem.error.stack}</div>
    }

    if (hasBuildError) {
      const [file, cause, ...errorInformation] = problem.error.split(`\n`)

      const open = () => {
        window.fetch(
          `/__open-stack-frame-in-editor?fileName=` +
            window.encodeURIComponent(file) +
            `&lineNumber=` +
            window.encodeURIComponent(1) // TODO
        )
      }

      header = (
        <>
          <div style={{ flex: 1 }}>
            <p style={{ marginBottom: 0 }}>{cause}</p>
            <a style={{ fontSize: `22px` }}>{file}</a>
          </div>
          <button onClick={open} style={styles.button}>
            OPEN IN EDITOR
          </button>
        </>
      )

      body = (
        <pre>
          <code
            dangerouslySetInnerHTML={{
              __html: prettifyStack(errorInformation),
            }}
          />
        </pre>
      )
    }

    if (problem) {
      return (
        <>
          <div style={{ filter: `blur(10px)` }}>{this.props.children}</div>
          <Overlay header={header} body={body} dismiss={this.dismiss} />
        </>
      )
    }

    return this.props.children
  }
}
