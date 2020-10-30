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
  it.each([
    `{Model.bar}/{Model.bar}.js`,
    `{Model.bar__(Union)__field}.js`,
    `{model.bar}.js`,
    `{model.bar__field}.js`,
    `{model.bar__(Union)__field}.js`,
    `{_model123.bar}.js`,
    `/products/{model.bar123}.js`,
    `{model.bar_123}.js`,
    `{model.bar__field123}.js`,
    `/products/{model.bar__(Union)__field123}.js`,
    `/products/prefix-{Model.id}.js`,
    `/products/prefix_{Model.id}.js`,
    `/products/prefix{Model.id}.js`,
  ])(`%o passes`, path => {
    expect(() =>
      isValidCollectionPathImplementation(compatiblePath(path), reporter)
    ).not.toThrow()
    const isValid = isValidCollectionPathImplementation(
      compatiblePath(path),
      reporter
    )
    expect(isValid).toBe(true)
  })

  it.each([
    `/products/{bar}`,
    `/products/{Model.}`,
    `/products/{Model:bar}`,
    `/products/{Model.bar.js`,
    `/products/{Model_bar}.js`,
    `/products/{123Model.bar}.js`,
    `/products/{Model.123bar}.js`,
    `/produts/Model}.js`,
    `/products/{Model.js`,
  ])(`%o throws as expected`, path => {
    const part = path.split(`/`)[2]

    const isValid = isValidCollectionPathImplementation(
      compatiblePath(path),
      reporter
    )
    expect(isValid).toBe(false)
    expect(reporter.panicOnBuild).toBeCalledWith({
      context: {
        sourceMessage: `Collection page builder encountered an error parsing the filepath. To use collection paths the schema to follow is {Model.field}. The problematic part is: ${part}.`,
      },
      filePath: compatiblePath(path),
      id: `gatsby-plugin-page-creator_12105`,
    })
  })
})
