import "@babel/polyfill"
import React from "react"
import { render, cleanup } from "react-testing-library"
import {
  createMemorySource,
  createHistory,
  LocationProvider,
} from "@reach/router"
import Link, { navigate, push, replace, withPrefix } from "../"

afterEach(() => {
  global.__PATH_PREFIX__ = ``
  cleanup()
})

const getInstance = (props, pathPrefix = ``) => {
  getWithPrefix()(pathPrefix)
  return <Link {...props} />
}

const getNavigate = () => {
  global.___navigate = jest.fn()
  return navigate
}

const getPush = () => {
  global.___push = jest.fn()
  return push
}

const getReplace = () => {
  global.___replace = jest.fn()
  return replace
}

const getWithPrefix = (pathPrefix = ``) => {
  global.__PATH_PREFIX__ = pathPrefix
  return withPrefix
}

const setup = ({ sourcePath = `/active`, linkProps, pathPrefix = `` } = {}) => {
  global.__PATH_PREFIX__ = pathPrefix
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

  it(`matches partially active snapshot`, () => {
    const { container } = setup({
      linkProps: { to: `/active/nested`, partiallyActive: true },
    })
    expect(container).toMatchSnapshot()
  })

  it(`does not fail to initialize without --prefix-paths`, () => {
    expect(() => {
      getInstance({})
    }).not.toThrow()
  })

  describe(`the location to link to`, () => {
    global.___loader = {
      enqueue: jest.fn(),
    }

    it(`accepts to as a string`, () => {
      const location = `/courses?sort=name`
      const { link } = setup({ linkProps: { to: location } })
      expect(link.getAttribute(`href`)).toEqual(location)
    })

    it(`includes the pathPrefix`, () => {
      const pathPrefix = `/prefixed`
      const location = `/courses?sort=name`
      const { link } = setup({ linkProps: { to: location }, pathPrefix })
      expect(link.getAttribute(`href`)).toEqual(`${pathPrefix}${location}`)
    })

    it(`does not warn when internal`, () => {
      jest.spyOn(global.console, `warn`)
      const to = `/courses?sort=name`
      setup({ linkProps: { to } })
      expect(console.warn).not.toBeCalled()
    })

    it(`warns when not internal`, () => {
      jest.spyOn(global.console, `warn`)
      const to = `https://gatsby.org`
      setup({ linkProps: { to } })
      expect(console.warn).toBeCalled()
    })
  })

  it(`push is called with correct args`, () => {
    getPush()(`/some-path`)
    expect(global.___push).toHaveBeenCalledWith(`/some-path`)
  })

  it(`replace is called with correct args`, () => {
    getReplace()(`/some-path`)
    expect(global.___replace).toHaveBeenCalledWith(`/some-path`)
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

describe(`navigate`, () => {
  it(`navigates to correct path`, () => {
    const to = `/some-path`
    getNavigate()(to)

    expect(global.___navigate).toHaveBeenCalledWith(to, undefined)
  })

  it(`respects pathPrefix`, () => {
    const to = `/some-path`
    global.__PATH_PREFIX__ = `/blog`
    getNavigate()(to)

    expect(global.___navigate).toHaveBeenCalledWith(
      `${global.__PATH_PREFIX__}${to}`,
      undefined
    )
  })
})

describe(`ref forwarding`, () => {
  it(`forwards ref`, () => {
    const ref = jest.fn()
    setup({ linkProps: { ref } })

    expect(ref).toHaveBeenCalledTimes(1)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement))
  })

  it(`remains backwards compatible with innerRef`, () => {
    const innerRef = jest.fn()
    setup({ linkProps: { innerRef } })

    expect(innerRef).toHaveBeenCalledTimes(1)
    expect(innerRef).toHaveBeenCalledWith(expect.any(HTMLElement))
  })

  it(`handles a RefObject (React >=16.4)`, () => {
    const ref = React.createRef(null)
    setup({ linkProps: { ref } })

    expect(ref.current).toEqual(expect.any(HTMLElement))
  })
})
