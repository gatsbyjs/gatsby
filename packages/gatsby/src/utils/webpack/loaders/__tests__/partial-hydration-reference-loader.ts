import fs from "fs-extra"
import path from "path"

// @ts-ignore - Doesn't understand CJS default exports?
import partialHydrationReferenceLoader from "../partial-hydration-reference-loader"

const rootContext = `/` // TODO: Figure out what this should be
const fixturesPath = path.resolve(__dirname, `./fixtures`)
const fixtures = fs.readdirSync(fixturesPath)

for (const fixture of fixtures) {
  const resourcePath = path.resolve(__dirname, `./fixtures/${fixture}`)
  const source = fs.readFileSync(resourcePath).toString()
  const fixtureName = fixture.split(`.`)[0]?.replace(/-/g, ` `)

  it(`${fixtureName} scenario is handled`, async () => {
    const mutatedSource = await partialHydrationReferenceLoader.call(
      { resourcePath, rootContext },
      source
    )
    expect(mutatedSource).toMatchSnapshot()
  })
}
