import { isValidCollectionPathImplementation } from "../is-valid-collection-path-implementation"
import reporter from "gatsby-cli/lib/reporter"
import syspath from "path"

jest.mock(`gatsby-cli/lib/reporter`)

// windows and mac have different seperators, all code is written with unix-like
// file systems, but the underlying code uses `path.sep`. So when running tests
// on windows, they would fail without us swapping the seperators.
const compatiblePath = (filepath: string): string =>
  filepath.replace(/\//g, syspath.sep)

describe(`isValidCollectionPathImplementation`, () => {
  it(`works`, () => {
    expect(() =>
      isValidCollectionPathImplementation(
        compatiblePath(`{Model.bar}/{Model.bar}.js`)
      )
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

    isValidCollectionPathImplementation(compatiblePath(path))
    expect(reporter.panicOnBuild)
      .toBeCalledWith(`Collection page builder encountered an error parsing the filepath. To use collection paths the schema to follow is {Model.field}. The problematic part is: ${part}.
filePath: ${compatiblePath(path)}`)
  })
})
