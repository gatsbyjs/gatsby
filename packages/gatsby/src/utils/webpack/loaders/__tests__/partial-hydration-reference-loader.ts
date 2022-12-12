import fs from "fs-extra"
import path from "path"

// @ts-ignore - Doesn't understand CJS default exports?
import partialHydrationReferenceLoader from "../partial-hydration-reference-loader"

const rootContext = __dirname
const fixturesPath = path.resolve(__dirname, `./fixtures`)
const fixtures = fs.readdirSync(fixturesPath)

for (const fixture of fixtures) {
  const resourcePath = path.resolve(__dirname, `./fixtures/${fixture}`)
  const source = fs.readFileSync(resourcePath).toString()

  it(`covers cases shown in fixtures/${fixture}`, async () => {
    const mutatedSource = await partialHydrationReferenceLoader.call(
      { resourcePath, rootContext },
      source
    )
    expect(mutatedSource).toMatchSnapshot()
  })
}
