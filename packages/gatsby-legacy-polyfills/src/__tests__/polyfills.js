const path = require(`path`)
const { TraceMap } = require(`@jridgewell/trace-mapping`)
const execa = require(`execa`)
const fs = require(`fs-extra`)

jest.setTimeout(60000)

describe(`polyfills`, () => {
  const packageRoot = path.resolve(__dirname, `../../`)
  const tmpDir = `.tmp`

  beforeAll(async () => {
    const pkg = require(`../../package.json`)
    const buildScript = pkg.scripts[`build:polyfills`].replace(
      ` --no-sourcemap`,
      ``
    )

    await execa(
      `yarn`,
      [
        ...buildScript.split(` `),
        `--no-compress`,
        `-o`,
        path.join(tmpDir, `polyfills.js`),
      ],
      { cwd: packageRoot }
    )
  })

  afterAll(() => fs.remove(path.join(packageRoot, tmpDir)))

  it(`has the correct polyfills`, () => {
    const polyfills = require(`../exclude`).LEGACY_POLYFILLS
    const polyfillMap = path.join(packageRoot, tmpDir, `polyfills.js.map`)
    expect(fs.existsSync(polyfillMap)).toBe(true)

    const fileMap = polyfills.map(polyfill => {
      if (polyfill === `features/dom-collections`) {
        return `core-js/modules/web.dom-collections`
      }

      return `core-js/modules/${polyfill
        .replace(/^(features|modules)\//, `es.`)
        .replace(`/`, `.`)}`
    })

    const polyfillMapSource = fs.readFileSync(polyfillMap, `utf8`)
    const tracer = new TraceMap(polyfillMapSource)
    const sources = tracer.sources.map(source =>
      source.replace(/.*\/node_modules\//, ``)
    )

    // check if all polyfills are in the bundle
    expect(sources).toEqual(
      expect.arrayContaining(fileMap.map(file => expect.stringContaining(file)))
    )
  })
})
