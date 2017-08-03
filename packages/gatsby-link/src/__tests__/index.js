import React from "react"

const getInstance = (props, pathPrefix = ``) => {
  Object.assign(global.window, {
    __PREFIX_PATHS__: pathPrefix ? true : false,
    __PATH_PREFIX__: pathPrefix,
  })

  const Link = require(`../`).default
  return new Link(props)
}

const getNavigateTo = () => {
  Object.assign(global.window, {
    ___navigateTo: jest.fn(),
  })

  return require(`../`).navigateTo
}

describe(`<Link />`, () => {
  it(`does not fail to initialize when __PREFIX_PATHS__ is not defined`, () => {
    expect(() => {
      const Link = require(`../`).default
      const link = new Link({}) //eslint-disable-line no-unused-vars
    }).not.toThrow()
  })

  describe(`path prefixing`, () => {
    it(`does not include path prefix by default`, () => {
      const to = `/path`
      const instance = getInstance({
        to,
      })

      expect(instance.state.to).toEqual(to)
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

  it(`navigateTo is called with correct args`, () => {
    getNavigateTo()(`/some-path`)

    expect(global.window.___navigateTo).toHaveBeenCalledWith(`/some-path`)
  })
})
