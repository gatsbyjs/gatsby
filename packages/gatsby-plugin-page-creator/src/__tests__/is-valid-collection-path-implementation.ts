import { isValidCollectionPathImplementation } from "../is-valid-collection-path-implementation"
import reporter from "gatsby-cli/lib/reporter"

jest.mock(`gatsby-cli/lib/reporter`)

describe(`isValidCollectionPathImplementation`, () => {
  it(`works`, () => {
    expect(() =>
      isValidCollectionPathImplementation(`{Model.bar}/{Model.bar}.js`)
    ).not.toThrow()
  })

  it.each([
    `/products/{bar}`,
    `/products/{missingCapitalization.bar}`,
    `/products/{Model.}`,
    `/products/{Model:bar}`,
    `/products/{Model.bar.js`,
  ])(`%o`, path => {
    const part = path.split(`/`)[2]

    isValidCollectionPathImplementation(path)
    expect(reporter.panicOnBuild)
      .toBeCalledWith(`Collection page builder encountered an error parsing the filepath. To use collection paths the schema to follow is {Model.field}. The problematic part is: ${part}.
filePath: ${path}`)
  })
})
