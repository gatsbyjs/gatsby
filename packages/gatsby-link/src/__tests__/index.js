import React from "react"
import ReactDOM from "react-dom"
import { MemoryRouter } from "react-router-dom"

const getInstance = (props, pathPrefix = ``) => {
  Object.assign(global.window, {
    __PATH_PREFIX__: pathPrefix,
  })

  const context = { router: { history: {} } }

  const Link = require(`../`).default
  return new Link(props, context)
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

  describe(`path prefixing`, () => {
    it(`does not include path prefix`, () => {
      const to = `/path`
      const pathPrefix = `/blog`
      const instance = getInstance({ to }, pathPrefix)

      expect(instance.state.to.pathname).toEqual(to)
    })
  })

  describe(`the location to link to`, () => {
    global.window.___loader = {
      enqueue: jest.fn(),
    }

    it(`accepts to as a string`, () => {
      const location = `/courses?sort=name`

      const node = document.createElement(`div`)
      const Link = require(`../`).default

      ReactDOM.render(
        <MemoryRouter>
          <Link to={location}>link</Link>
        </MemoryRouter>,
        node
      )

      const href = node.querySelector(`a`).getAttribute(`href`)

      expect(href).toEqual(location)
    })

    it(`accepts a location "to" prop`, () => {
      const location = {
        pathname: `/courses`,
        search: `?sort=name`,
        hash: `#the-hash`,
        state: { fromDashboard: true },
      }

      const node = document.createElement(`div`)
      const Link = require(`../`).default

      ReactDOM.render(
        <MemoryRouter>
          <Link to={location}>link</Link>
        </MemoryRouter>,
        node
      )

      const href = node.querySelector(`a`).getAttribute(`href`)

      expect(href).toEqual(`/courses?sort=name#the-hash`)
    })

    it(`resolves to with no pathname using current location`, () => {
      const location = {
        search: `?sort=name`,
        hash: `#the-hash`,
      }

      const node = document.createElement(`div`)
      const Link = require(`../`).default

      ReactDOM.render(
        <MemoryRouter initialEntries={[`/somewhere`]}>
          <Link to={location}>link</Link>
        </MemoryRouter>,
        node
      )

      const href = node.querySelector(`a`).getAttribute(`href`)

      expect(href).toEqual(`/somewhere?sort=name#the-hash`)
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
