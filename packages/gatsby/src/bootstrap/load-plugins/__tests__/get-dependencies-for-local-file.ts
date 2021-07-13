import getDependencies from "../get-dependencies-for-local-file"
import path from "path"

describe(`gets dependencies`, () => {
  it(`gets dependencies with file hash`, async () => {
    const result = await getDependencies(
      __dirname,
      path.join(`fixtures`, `file-with-node-dependency.ts`)
    )
    expect(result).toMatchSnapshot()

    const result2 = await getDependencies(
      __dirname,
      path.join(`fixtures`, `requires-other-local-file.js`)
    )
    expect(result2).toMatchSnapshot()
    expect(Object.keys(result2)).toHaveLength(2)
  })
  it(`gets npm dependencies with version`, async () => {
    const result = await getDependencies(
      __dirname,
      path.join(`fixtures`, `has-dependency.js`)
    )
    // Strange way perhaps to test this is a version string e.g. 8.1.2
    expect(result.precinct.split(`.`)).toHaveLength(3)
  })
})
