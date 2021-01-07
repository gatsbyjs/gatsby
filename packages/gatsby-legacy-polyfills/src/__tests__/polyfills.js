const path = require(`path`)
const { SourceMapConsumer } = require(`source-map`)
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

    const fileMap = polyfills.map(
      polyfill =>
        `core-js/modules/${polyfill
          .replace(/^(features|modules)\//, `es.`)
          .replace(`/`, `.`)}`
    )

    const polyfillMapSource = fs.readFileSync(polyfillMap, `utf8`)
    SourceMapConsumer.with(polyfillMapSource, null, consumer => {
      const sources = consumer.sources

      // check if all polyfills are in the bundle
      expect(sources).toEqual(
        expect.arrayContaining(
          fileMap.map(file => expect.stringContaining(file))
        )
      )
    })
  })
})
