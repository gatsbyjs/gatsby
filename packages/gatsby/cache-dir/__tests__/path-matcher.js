const {
  matchPathFactory,
  addPathFactory,
  createPathsFromArray,
} = require(`../path-matcher`)

fdescribe(`Path Matcher`, () => {
  describe(`create`, () => {
    it(`should add paths from an array of paths`, () => {
      const routes = [
        { path: `/app`, matchPath: `/game/test/*` },
        { path: `/app/nice` },
        { path: `/new` },
      ]

      expect(createPathsFromArray(routes)).toEqual({
        c: {
          app: {
            v: { path: `/app`, matchPath: `/game/test/*` },
            c: {
              nice: {
                v: { path: `/app/nice` },
              },
            },
          },
          new: {
            v: { path: `/new` },
          },
          game: {
            c: {
              test: {
                c: {
                  "*": {
                    v: { path: `/app`, matchPath: `/game/test/*` },
                  },
                },
              },
            },
          },
        },
      })
    })

    it(`should add a path to an already existing path`, () => {
      const root = {
        c: {
          app: {
            v: { path: `/app` },
          },
        },
      }

      addPathFactory(root)(`/app/test`, { path: `/app/test` })

      expect(root).toEqual({
        c: {
          app: {
            v: {
              path: `/app`,
            },
            c: {
              test: {
                v: { path: `/app/test` },
              },
            },
          },
        },
      })
    })
  })

  describe(`match`, () => {
    let match

    beforeEach(() => {
      const routes = [
        { path: `/so-deep`, matchPath: `/deeply/nested/route/*` },
        { path: `/deeply/nested/route/that/is/not/so/deep` },
        { path: `/deeply/nested` },
      ]

      match = matchPathFactory(createPathsFromArray(routes))
    })

    it(`should match nested routes`, () => {
      expect(match(`/deeply/nested`).path).toBe(`/deeply/nested`)
      expect(match(`/deeply/nested/route/that/is/not/so/deep`).path).toBe(
        `/deeply/nested/route/that/is/not/so/deep`
      )
    })

    it(`should try and match the entire route before falling back to matchPath`, () => {
      expect(match(`/deeply/nested/route/that/is/not/so/deep`).path).toBe(
        `/deeply/nested/route/that/is/not/so/deep`
      )
      expect(
        match(`/deeply/nested/route/that/is/not/so/deep/too-far`).path
      ).toBe(`/so-deep`)
    })

    it(`should not care about trailing slashes`, () => {
      expect(match(`/so-deep/`).path).toBe(`/so-deep`)
    })
  })
})
