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

import * as fs from "fs-extra"
import path from "path"
import reporter from "gatsby-cli/lib/reporter"
import { resolveModuleExports } from "../resolve-module-exports"

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
          this.state = { exiting: false, nextPageResources: {}}
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
            appear: true,
            in: !this.state.exiting,
            key: this.props.location.key,
          }
          transitionProps.timeout.enter = 0
          transitionProps.timeout.exit = timeout
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
    "/export/default": `export default () => {}`,
    "/export/default/name": `const foo = () => {}; export default foo`,
    "/export/default/function": `export default function() {}`,
    "/export/default/function/name": `export default function foo() {}`,
    "/export/function": `export function foo() {}`,
  }

  const mockDir = path.resolve(__dirname, `..`, `__mocks__`)

  beforeEach(() => {
    resolver = jest.fn(arg => arg)
    // @ts-ignore
    fs.readFileSync.mockImplementation(file => {
      const existing = MOCK_FILE_INFO[file]
      return existing
    })
    // @ts-ignore
    reporter.panic.mockClear()
  })

  it(`Returns empty array for file paths that don't exist`, async () => {
    const result = await resolveModuleExports(`/file/path/does/not/exist`)
    expect(result).toEqual([])
  })

  it(`Returns empty array for directory paths that don't exist`, async () => {
    const result = await resolveModuleExports(`/directory/path/does/not/exist/`)
    expect(result).toEqual([])
  })

  it(`Show meaningful error message for invalid JavaScript`, async () => {
    await resolveModuleExports(`/bad/file`, { resolver })
    expect(
      // @ts-ignore
      reporter.panic.mock.calls.map(c =>
        // Remove console colors + trim whitespace
        // eslint-disable-next-line
        c[0].replace(/\x1B[[(?);]{0,2}(;?\d)*./g, ``).trim()
      )
    ).toMatchSnapshot()
  })

  it(`Resolves an export`, async () => {
    const result = await resolveModuleExports(`/simple/export`, { resolver })
    expect(result).toEqual([`foo`])
  })

  it(`Resolves multiple exports`, async () => {
    const result = await resolveModuleExports(`/multiple/export`, { resolver })
    expect(result).toEqual([`bar`, `baz`, `foo`])
  })

  it(`Resolves an export from an ES6 file`, async () => {
    const result = await resolveModuleExports(`/import/with/export`, {
      resolver,
    })
    expect(result).toEqual([`baz`])
  })

  it(`Resolves an exported const`, async () => {
    const result = await resolveModuleExports(`/export/const`, { resolver })
    expect(result).toEqual([`fooConst`])
  })

  it(`Resolves module.exports`, async () => {
    const result = await resolveModuleExports(`/module/exports`, { resolver })
    expect(result).toEqual([`barExports`])
  })

  it(`Resolves exports from a larger file`, async () => {
    const result = await resolveModuleExports(`/realistic/export`, { resolver })
    expect(result).toEqual([`replaceHistory`, `replaceComponentRenderer`])
  })

  it(`Ignores exports.__esModule`, async () => {
    const result = await resolveModuleExports(`/esmodule/export`, { resolver })
    expect(result).toEqual([`foo`])
  })

  it(`Resolves a named export`, async () => {
    const result = await resolveModuleExports(`/export/named`, { resolver })
    expect(result).toEqual([`foo`])
  })

  it(`Resolves a named export from`, async () => {
    const result = await resolveModuleExports(`/export/named/from`, {
      resolver,
    })
    expect(result).toEqual([`Component`])
  })

  it(`Resolves a named export as`, async () => {
    const result = await resolveModuleExports(`/export/named/as`, { resolver })
    expect(result).toEqual([`bar`])
  })

  it(`Resolves multiple named exports`, async () => {
    const result = await resolveModuleExports(`/export/named/multiple`, {
      resolver,
    })
    expect(result).toEqual([`foo`, `bar`, `baz`])
  })

  it(`Resolves default export`, async () => {
    const result = await resolveModuleExports(`/export/default`, { resolver })
    expect(result).toEqual([`export default`])
  })

  it(`Resolves default export with name`, async () => {
    const result = await resolveModuleExports(`/export/default/name`, {
      resolver,
    })
    expect(result).toEqual([`export default foo`])
  })

  it(`Resolves default function`, async () => {
    const result = await resolveModuleExports(`/export/default/function`, {
      resolver,
    })
    expect(result).toEqual([`export default`])
  })

  it(`Resolves default function with name`, async () => {
    const result = await resolveModuleExports(`/export/default/function/name`, {
      resolver,
    })
    expect(result).toEqual([`export default foo`])
  })

  it(`Resolves function declaration`, async () => {
    const result = await resolveModuleExports(`/export/function`, { resolver })
    expect(result).toEqual([`foo`])
  })

  it(`Resolves exports when using import mode - simple case`, async () => {
    jest.mock(`import/exports`)

    const result = await resolveModuleExports(
      path.join(mockDir, `import`, `exports`),
      {
        mode: `import`,
      }
    )
    expect(result).toEqual([`foo`, `bar`])
  })

  it(`Resolves exports when using import mode - unusual case`, async () => {
    jest.mock(`import/unusual-exports`)

    const result = await resolveModuleExports(
      path.join(mockDir, `import`, `unusual-exports`),
      {
        mode: `import`,
      }
    )
    expect(result).toEqual([`foo`])
  })

  it(`Resolves exports when using import mode - returns empty array when module doesn't exist`, async () => {
    const result = await resolveModuleExports(
      path.join(mockDir, `import`, `not-existing-module`),
      {
        mode: `import`,
      }
    )
    expect(result).toEqual([])
  })

  it(`Resolves exports when using import mode - panic on errors`, async () => {
    jest.mock(`import/module-error`)

    await resolveModuleExports(path.join(mockDir, `import`, `module-error`), {
      mode: `import`,
    })

    expect(reporter.panic).toBeCalled()
  })
})
