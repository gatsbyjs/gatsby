jest.mock(`fs`, () => {
  const fs = jest.requireActual(`fs`)
  return {
    ...fs,
    readFileSync: jest.fn(),
  }
})
jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    panic: jest.fn(),
  }
})

const fs = require(`fs`)
const reporter = require(`gatsby-cli/lib/reporter`)
const resolveModuleExports = require(`../resolve-module-exports`)
let resolver

describe(`Resolve module exports`, () => {
  const MOCK_FILE_INFO = {
    "/bad/file": `const exports.blah = () = }}}`,
    "/simple/export": `exports.foo = '';`,
    "/export/const": `export const fooConst = '';`,
    "/module/exports": `module.exports.barExports = '';`,
    "/multiple/export": `exports.bar = () => ''; exports.baz = {}; exports.foo = '';`,
    "/import/with/export": `import * as React from 'react'; exports.baz = '';`,
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
    "/esmodule/export": `
      exports.__esModule = true;
      exports.foo = '';
    `,
    "/export/named": `const foo = ''; export { foo };`,
    "/export/named/from": `export { Component } from 'react';`,
    "/export/named/as": `const foo = ''; export { foo as bar };`,
    "/export/named/multiple": `const foo = ''; const bar = ''; const baz = ''; export { foo, bar, baz };`,
  }

  beforeEach(() => {
    resolver = jest.fn(arg => arg)
    fs.readFileSync.mockImplementation(file => {
      const existing = MOCK_FILE_INFO[file]
      return existing
    })
    reporter.panic.mockClear()
  })

  it(`Returns empty array for file paths that don't exist`, () => {
    const result = resolveModuleExports(`/file/path/does/not/exist`)
    expect(result).toEqual([])
  })

  it(`Returns empty array for directory paths that don't exist`, () => {
    const result = resolveModuleExports(`/directory/path/does/not/exist/`)
    expect(result).toEqual([])
  })

  it(`Show meaningful error message for invalid JavaScript`, () => {
    resolveModuleExports(`/bad/file`, { resolver })
    expect(
      reporter.panic.mock.calls.map(c =>
        // Remove console colors + trim whitespace
        // eslint-disable-next-line
        c[0].replace(/\x1B[[(?);]{0,2}(;?\d)*./g, ``).trim()
      )
    ).toMatchSnapshot()
  })

  it(`Resolves an export`, () => {
    const result = resolveModuleExports(`/simple/export`, { resolver })
    expect(result).toEqual([`foo`])
  })

  it(`Resolves multiple exports`, () => {
    const result = resolveModuleExports(`/multiple/export`, { resolver })
    expect(result).toEqual([`bar`, `baz`, `foo`])
  })

  it(`Resolves an export from an ES6 file`, () => {
    const result = resolveModuleExports(`/import/with/export`, { resolver })
    expect(result).toEqual([`baz`])
  })

  it(`Resolves an exported const`, () => {
    const result = resolveModuleExports(`/export/const`, { resolver })
    expect(result).toEqual([`fooConst`])
  })

  it(`Resolves module.exports`, () => {
    const result = resolveModuleExports(`/module/exports`, { resolver })
    expect(result).toEqual([`barExports`])
  })

  it(`Resolves exports from a larger file`, () => {
    const result = resolveModuleExports(`/realistic/export`, { resolver })
    expect(result).toEqual([`replaceHistory`, `replaceComponentRenderer`])
  })

  it(`Ignores exports.__esModule`, () => {
    const result = resolveModuleExports(`/esmodule/export`, { resolver })
    expect(result).toEqual([`foo`])
  })

  it(`Resolves a named export`, () => {
    const result = resolveModuleExports(`/export/named`, { resolver })
    expect(result).toEqual([`foo`])
  })

  it(`Resolves a named export from`, () => {
    const result = resolveModuleExports(`/export/named/from`, { resolver })
    expect(result).toEqual([`Component`])
  })

  it(`Resolves a named export as`, () => {
    const result = resolveModuleExports(`/export/named/as`, { resolver })
    expect(result).toEqual([`bar`])
  })

  it(`Resolves multiple named exports`, () => {
    const result = resolveModuleExports(`/export/named/multiple`, { resolver })
    expect(result).toEqual([`foo`, `bar`, `baz`])
  })

  it(`Resolves exports when using require mode - simple case`, () => {
    jest.mock(`require/exports`)

    const result = resolveModuleExports(`require/exports`, {
      mode: `require`,
    })
    expect(result).toEqual([`foo`, `bar`])
  })

  it(`Resolves exports when using require mode - unusual case`, () => {
    jest.mock(`require/unusual-exports`)

    const result = resolveModuleExports(`require/unusual-exports`, {
      mode: `require`,
    })
    expect(result).toEqual([`foo`])
  })

  it(`Resolves exports when using require mode - returns empty array when module doesn't exist`, () => {
    const result = resolveModuleExports(`require/not-existing-module`, {
      mode: `require`,
    })
    expect(result).toEqual([])
  })

  it(`Resolves exports when using require mode - panic on errors`, () => {
    jest.mock(`require/module-error`)

    resolveModuleExports(`require/module-error`, {
      mode: `require`,
    })

    expect(reporter.panic).toBeCalled()
  })
})
