import React from "react"
import ReactDOM from "react-dom"
import {
  createMemorySource,
  createHistory,
  LocationProvider,
} from "@reach/router"

const getInstance = (props, pathPrefix = ``) => {
  Object.assign(global.window, {
    __PATH_PREFIX__: pathPrefix,
  })

  const context = { router: { history: {} } }

  const Link = require(`../`).default
  return Link(props, context)
}

const getPush = () => {
  Object.assign(global.window, {
    ___push: jest.fn(),
  })

  return require(`../`).push
}

const getReplace = () => {
  Object.assign(global.window, {
    ___replace: jest.fn(),
  })

  return require(`../`).replace
}

const getWithPrefix = (pathPrefix = ``) => {
  Object.assign(global.window, {
    __PATH_PREFIX__: pathPrefix,
  })
  return require(`../`).withPrefix
}

describe(`<Link />`, () => {
  it(`does not fail to initialize without --prefix-paths`, () => {
    expect(() => {
      getInstance({})
    }).not.toThrow()
  })

  describe(`the location to link to`, () => {
    global.window.___loader = {
      enqueue: jest.fn(),
    }

    it(`accepts to as a string`, () => {
      const location = `/courses?sort=name`

      const node = document.createElement(`div`)
      const Link = require(`../`).default
      let source = createMemorySource(`/`)
      let history = createHistory(source)

      ReactDOM.render(
        <LocationProvider history={history}>
          <Link to={location}>link</Link>
        </LocationProvider>,
        node
      )

      const href = node.querySelector(`a`).getAttribute(`href`)

      expect(href).toEqual(location)
    })
  })

  it(`push is called with correct args`, () => {
    getPush()(`/some-path`)

    expect(global.window.___push).toHaveBeenCalledWith(`/some-path`)
  })

  it(`replace is called with correct args`, () => {
    getReplace()(`/some-path`)

    expect(global.window.___replace).toHaveBeenCalledWith(`/some-path`)
  })
})

describe(`withPrefix`, () => {
  describe(`works with default prefix`, () => {
    it(`default prefix does not return "//"`, () => {
      const to = `/`
      const root = getWithPrefix()(to)
      expect(root).toEqual(to)
    })

    it(`respects path prefix`, () => {
      const to = `/abc/`
      const pathPrefix = `/blog`
      const root = getWithPrefix(pathPrefix)(to)
      expect(root).toEqual(`${pathPrefix}${to}`)
    })
  })
})
