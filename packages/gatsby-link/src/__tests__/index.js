import React from "react"
import ReactDOM from "react-dom"
import { MemoryRouter } from "react-router-dom"

const getInstance = (props, pathPrefix = ``) => {
  Object.assign(global.window, {
    __PREFIX_PATHS__: pathPrefix ? true : false,
    __PATH_PREFIX__: pathPrefix,
  })

  const context = { router: { history: {} } }

  const Link = require(`../`).default
  return new Link(props, context)
}

const getNavigateTo = () => {
  Object.assign(global.window, {
    ___navigateTo: jest.fn(),
  })

  return require(`../`).navigateTo
}

const getWithPrefix = (pathPrefix = ``) => {
  Object.assign(global.window, {
    __PREFIX_PATHS__: pathPrefix ? true : false,
    __PATH_PREFIX__: pathPrefix,
  })
  return require(`../`).withPrefix
}

describe(`<Link />`, () => {
  it(`does not fail to initialize when __PREFIX_PATHS__ is not defined`, () => {
    expect(() => {
      const context = { router: { history: {} } }
      const Link = require(`../`).default
      const link = new Link({}, context) //eslint-disable-line no-unused-vars
    }).not.toThrow()
  })

  describe(`path prefixing`, () => {
    it(`does not include path prefix by default`, () => {
      const to = `/path`
      const instance = getInstance({
        to,
      })

      expect(instance.state.to.pathname).toEqual(to)
    })

    /*
     * Running _both_ of these tests causes the globals to be cached or something
     */
    it.skip(`will use __PATH_PREFIX__ if __PREFIX_PATHS__ defined`, () => {
      const to = `/path`
      const pathPrefix = `/blog`

      const instance = getInstance(
        {
          to,
        },
        pathPrefix
      )

      expect(instance.state.to).toEqual(`${pathPrefix}${to}`)
    })
  })

  describe(`the location to link to`, () => {
    global.___loader = {
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

  it(`navigateTo is called with correct args`, () => {
    getNavigateTo()(`/some-path`)

    expect(global.window.___navigateTo).toHaveBeenCalledWith(`/some-path`)
  })
})

describe(`withRouter`, () => {
  describe(`works with default prefix`, () => {
    it(`default prefix does not return "//"`, () => {
      const to = `/`
      const root = getWithPrefix()(to)
      expect(root).toEqual(to)
    })

    /*
     * Same as above, settings a path perfix does not work because the 
     * link module sets variables on first import
     */
    it.skip(`respects path prefix`, () => {
      const to = `/abc/`
      const pathPrefix = `/blog`
      const root = getWithPrefix(pathPrefix)(to)
      expect(root).toEqual(`${pathPrefix}${to}`)
    })
  })
})
