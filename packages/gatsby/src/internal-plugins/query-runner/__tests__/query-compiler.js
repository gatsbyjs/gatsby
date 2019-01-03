jest.mock(`glob`, () => {
  const sync = jest.fn().mockImplementation(() => [])
  return {
    sync,
  }
})
const path = require(`path`)
const glob = require(`glob`)
const { resolveThemes, Runner } = require(`../query-compiler`)

const base = path.resolve(``)

describe(`Runner`, () => {
  beforeEach(() => {
    glob.sync.mockClear()
  })

  it(`returns a file parser instance`, async () => {
    const runner = new Runner(base, [], {})

    const parser = await runner.parseEverything()

    expect(parser).toEqual(new Map())
  })

  describe(`expected directories`, () => {
    it(`compiles src directory`, async () => {
      const runner = new Runner(base, [], {})

      await runner.parseEverything()

      expect(glob.sync).toHaveBeenCalledWith(
        expect.stringContaining(path.join(base, `src`)),
        expect.any(Object)
      )
    })

    it(`compiles fragments directory`, async () => {
      const runner = new Runner(base, [], {})

      await runner.parseEverything()

      expect(glob.sync).toHaveBeenCalledWith(
        expect.stringContaining(path.join(base, `src`)),
        expect.any(Object)
      )
    })

    it(`compiles themes directory(s)`, async () => {
      const theme = `gatsby-theme-whatever`
      const runner = new Runner(
        base,
        [path.join(base, `node_modules`, theme)],
        {}
      )

      await runner.parseEverything()

      expect(glob.sync).toHaveBeenCalledWith(
        expect.stringContaining(path.join(base, `node_modules`, theme)),
        expect.any(Object)
      )
    })
  })
})

describe(`resolveThemes`, () => {
  it(`returns empty array if zero themes detected`, () => {
    ;[
      [],
      [{ resolve: path.join(base, `gatsby-plugin-whatever`) }],
      undefined,
    ].forEach(testRun => {
      expect(resolveThemes(testRun)).toEqual([])
    })
  })

  it(`returns plugins matching gatsby-theme prefix`, () => {
    const theme = `gatsby-theme-example`
    expect(
      resolveThemes([
        {
          resolve: path.join(base, `gatsby-theme-example`),
        },
      ])
    ).toEqual([expect.stringContaining(theme)])
  })

  it(`handles scoped packages`, () => {
    const theme = `@dschau/gatsby-theme-example`

    expect(
      resolveThemes([
        {
          resolve: path.join(base, theme),
        },
      ])
    ).toEqual([expect.stringContaining(theme.split(`/`).join(path.sep))])
  })
})
