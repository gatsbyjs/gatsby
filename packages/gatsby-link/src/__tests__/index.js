import "@babel/polyfill"
import React from "react"
import { render, cleanup } from "react-testing-library"
import {
  createMemorySource,
  createHistory,
  LocationProvider,
} from "@reach/router"
import Link, { push, replace, withPrefix } from "../"

afterEach(cleanup)

const getInstance = (props, pathPrefix = ``) => {
  getWithPrefix()(pathPrefix)
  return Link(props)
}

const getPush = () => {
  Object.assign(global.window, {
    ___push: jest.fn(),
  })

  return push
}

const getReplace = () => {
  Object.assign(global.window, {
    ___replace: jest.fn(),
  })

  return replace
}

const getWithPrefix = (pathPrefix = ``) => {
  Object.assign(global.window, {
    __PATH_PREFIX__: pathPrefix,
  })
  return withPrefix
}

const setup = ({ sourcePath = `/active`, linkProps } = {}) => {
  const source = createMemorySource(sourcePath)
  const history = createHistory(source)

  const utils = render(
    <LocationProvider history={history}>
      <Link
        to="/"
        className="link"
        style={{ color: `black` }}
        activeClassName="is-active"
        activeStyle={{ textDecoration: `underline` }}
        {...linkProps}
      >
        link
      </Link>
    </LocationProvider>
  )

  return Object.assign({}, utils, {
    link: utils.getByText(`link`),
  })
}

describe(`<Link />`, () => {
  it(`matches basic snapshot`, () => {
    const { container } = setup()
    expect(container).toMatchSnapshot()
  })

  it(`matches active snapshot`, () => {
    const { container } = setup({ linkProps: { to: `/active` } })
    expect(container).toMatchSnapshot()
  })

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
      const { link } = setup({ linkProps: { to: location } })

      expect(link.getAttribute(`href`)).toEqual(location)
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
