import { isValidCollectionPathImplementation } from "../is-valid-collection-path-implementation"

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

    try {
      isValidCollectionPathImplementation(path)
      throw new Error(`test safety throw. This should not be hit`)
    } catch (e) {
      expect(e.message).toMatchInlineSnapshot(`
        "Collection page builder encountered an error parsing the filepath. To use collection paths the schema to follow is {Model.field}. The problematic part is: ${part}.
        filePath: ${path}"
      `)
    }
  })
})
