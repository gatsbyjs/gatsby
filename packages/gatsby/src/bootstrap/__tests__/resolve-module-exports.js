jest.mock(`fs`)

const resolveModuleExports = require(`../resolve-module-exports`)
let resolver

describe(`Resolve module exports`, () => {
  const MOCK_FILE_INFO = {
    "/bad/file": `const exports.blah = () = }}}`,
    "/simple/export": `exports.foo = '';`,
    "/multiple/export": `exports.bar = () => ''; exports.baz = {}; exports.foo = '';`,
    "/import/with/export": `import React from 'react'; exports.baz = '';`,
    "/realistic/export": `
      /* eslint-disable react/prop-types */
      /* globals window CustomEvent */
      import React, { createElement } from "react"
      import { Transition } from "react-transition-group"
      import createHistory from "history/createBrowserHistory"

      import getTransitionStyle from "./src/utils/getTransitionStyle"

      const timeout = 250
      const historyExitingEventType = 'history::exiting'

      const getUserConfirmation = (pathname, callback) => {
        const event = new CustomEvent(historyExitingEventType, { detail: { pathname } })
        window.dispatchEvent(event)
        setTimeout(() => {
          callback(true)
        }, timeout)
      }
      const history = createHistory({ getUserConfirmation })
      // block must return a string to conform
      history.block((location, action) => location.pathname)
      exports.replaceHistory = () => history

      class ReplaceComponentRenderer extends React.Component {
        constructor(props) {
          super(props)
          this.state = { exiting: false, nextPageResources: {} }
          this.listenerHandler = this.listenerHandler.bind(this)
        }

        listenerHandler(event) {
          const nextPageResources = this.props.loader.getResourcesForPathname(
            event.detail.pathname,
            nextPageResources => this.setState({ nextPageResources })
          ) || {}
          this.setState({ exiting: true, nextPageResources })
        }

        componentDidMount() {
          window.addEventListener(historyExitingEventType, this.listenerHandler)
        }

        componentWillUnmount() {
          window.removeEventListener(historyExitingEventType, this.listenerHandler)
        }

        componentWillReceiveProps(nextProps) {
          if (this.props.location.key !== nextProps.location.key) {
            this.setState({ exiting: false, nextPageResources: {} })
          }
        }

        render() {
          const transitionProps = {
            timeout: {
              enter: 0,
              exit: timeout,
            },
            appear: true,
            in: !this.state.exiting,
            key: this.props.location.key,
          }
          return (
            <Transition {...transitionProps}>
            {
              (status) => createElement(this.props.pageResources.component, {
                ...this.props,
                ...this.props.pageResources.json,
                transition: {
                  status,
                  timeout,
                  style: getTransitionStyle({ status, timeout }),
                  nextPageResources: this.state.nextPageResources,
                },
              })
            }
            </Transition>
          )
        }
      }

      // eslint-disable-next-line react/display-name
      exports.replaceComponentRenderer = ({ props, loader }) => {
        if (props.layout) {
          return undefined
        }
        return createElement(ReplaceComponentRenderer, { ...props, loader })
      }
    `,
  }

  beforeEach(() => {
    resolver = jest.fn(arg => arg)
    require(`fs`).__setMockFiles(MOCK_FILE_INFO)
  })

  it(`Returns empty array for file paths that don't exist`, () => {
    const result = resolveModuleExports(`/file/path/does/not/exist`)
    expect(result).toEqual([])
  })

  it(`Returns empty array for directory paths that don't exist`, () => {
    const result = resolveModuleExports(`/directory/path/does/not/exist/`)
    expect(result).toEqual([])
  })

  it(`Returns empty array for invalid JavaScript`, () => {
    const result = resolveModuleExports(`/bad/file`)
    expect(result).toEqual([])
  })

  it(`Resolves an export`, () => {
    const result = resolveModuleExports(`/simple/export`, resolver)
    expect(result).toEqual([`foo`])
  })

  it(`Resolves multiple exports`, () => {
    const result = resolveModuleExports(`/multiple/export`, resolver)
    expect(result).toEqual([`bar`, `baz`, `foo`])
  })

  it(`Resolves an export from an ES6 file`, () => {
    const result = resolveModuleExports(`/import/with/export`, resolver)
    expect(result).toEqual([`baz`])
  })

  it(`Resolves exports from a larger file`, () => {
    const result = resolveModuleExports(`/realistic/export`, resolver)
    expect(result).toEqual([`replaceHistory`, `replaceComponentRenderer`])
  })
})
