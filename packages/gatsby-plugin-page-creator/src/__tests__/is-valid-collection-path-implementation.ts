import { isValidCollectionPathImplementation } from "../is-valid-collection-path-implementation"
import reporter from "gatsby/reporter"
import syspath from "path"

jest.mock(`gatsby/reporter`, () => {
  return {
    panicOnBuild: jest.fn(),
  }
})

// windows and mac have different separators, all code is written with unix-like
// file systems, but the underlying code uses `path.sep`. So when running tests
// on windows, they would fail without us swapping the separators.
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
    `/products/{model.bar123}/{model.foo}.js`,
    `/products/{model.bar123}/test/{model.foo}.js`,
    `/products/{model.bar123}/{model.foo}/template.js`,
    `{model.bar_123}.js`,
    `{model.bar__field123}.js`,
    `/products/{model.bar__(Union)__field123}.js`,
    `/products/prefix-{Model.id}.js`,
    `/products/prefix_{Model.id}.js`,
    `/products/prefix{Model.id}.js`,
    `/products/{Model.id}postfix.js`,
    `/products/{Model.bar}/[name].js`,
    `/products/{Model.bar}/[...name].js`,
    `/products/{M.id}.js`,
    `/products/{M.i}.js`,
    `/products/{Model.id}-{Model.foo}.js`,
    `/products/prefix-{Model.id}-{Model.foo}.js`,
    `/products/{Model.id}-{Model.foo}-postfix.js`,
    `/products/{Model.id}_{Model.foo}.js`,
    `/products/{Model.id}.{Model.foo}.js`,
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

  // Error in second part
  it.each([
    `/products/{bar}.js`,
    `/products/{Model.}.js`,
    `/products/{Model:bar}.js`,
    `/products/{Model.bar.js`,
    `/products/{Model_bar}.js`,
    `/products/{123Model.bar}.js`,
    `/products/{Model.123bar}.js`,
    `/produts/Model}.js`,
    `/products/{Model.js`,
    `/products/{Model.foo.bar}.js`,
    `/products/prefix-{Model.foo.bar}.js`,
    `/products/prefix-{Model.foo.bar__baz}.js`,
    `/products/prefix-{Model.foo.bar.baz}.js`,
    `/{Model.test}/{Model.id.js`,
    `/{Model.test}/Model.id}.js`,
    `/products/{Model.id}-{Model.}.js`,
    `/products/{Model.id}-{Model_foo}.js`,
    `/products/{Model.id}-Model.id}.js`,
    `/products/Model.id}-{Model.id}.js`,
    `/products/Model.id}-Model.id}.js`,
    `/products/{Model.id-{Model.id.js`,
    `/products/{Model.id-Model.id.js`,
    `/products/Model.id}-Model.id.js`,
    `/products/Model.id-{Model.id.js`,
    `/products/Model.id-Model.id}.js`,
  ])(`%o throws as expected`, path => {
    const part = path.split(`/`)[2]

    const isValid = isValidCollectionPathImplementation(
      compatiblePath(path),
      reporter
    )
    expect(isValid).toBe(false)
    expect(reporter.panicOnBuild).toBeCalledWith({
      context: {
        sourceMessage: `Collection page builder encountered an error parsing the filepath. To use collection paths the schema to follow is {Model.field__subfield}. The problematic part is: ${part}.`,
      },
      filePath: compatiblePath(path),
      id: `gatsby-plugin-page-creator_12105`,
    })
  })

  // Error in first part
  it.each([
    `/Model.test}/{Model.id}.js`,
    `/{Model.test/{Model.id}.js`,
    `/{Model_test}/{Model.id}.js`,
    `/{Model:test}/{Model.id}.js`,
    `/{Model.}/{Model.id}.js`,
    `/{123Model.test}/{Model.id}.js`,
    `/{bar}/{Model.id}.js`,
    `/{Model.123bar}/{Model.id}.js`,
    `/Model}/{Model.id}.js`,
    `/{Model./{Model.id}js`,
    `/{Model.foo.bar}/{Model.id}.js`,
    `/prefix-{Model.foo.bar}/{Model.id}.js`,
    `/prefix-{Model.foo.bar__baz}/{Model.id}.js`,
    `/prefix-{Model.foo.bar.baz}/{Model.id}.js`,
  ])(`%o throws as expected`, path => {
    const part = path.split(`/`)[1]

    const isValid = isValidCollectionPathImplementation(
      compatiblePath(path),
      reporter
    )
    expect(isValid).toBe(false)
    expect(reporter.panicOnBuild).toBeCalledWith({
      context: {
        sourceMessage: `Collection page builder encountered an error parsing the filepath. To use collection paths the schema to follow is {Model.field__subfield}. The problematic part is: ${part}.`,
      },
      filePath: compatiblePath(path),
      id: `gatsby-plugin-page-creator_12105`,
    })
  })
})
