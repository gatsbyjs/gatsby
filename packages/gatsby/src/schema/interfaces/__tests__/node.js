const { TypeComposer } = require(`graphql-compose`)

const {
  addNodeInterface,
  addNodeInterfaceFields,
  getNodeInterfaceFields,
  hasNodeInterface,
} = require(`../node`)

describe(`Node interface`, () => {
  it(`addNodeInterface`, () => {
    const tc = TypeComposer.create(`type Foo { bar: Boolean }`)
    const fields = getNodeInterfaceFields()
    addNodeInterface(tc)
    expect(hasNodeInterface(tc)).toBeTruthy()
    expect(tc.getFieldNames()).toEqual(expect.arrayContaining(fields))
  })

  it(`addNodeInterfaceFields`, () => {
    const tc = TypeComposer.create(`type Baz { qux: Boolean }`)
    const fields = getNodeInterfaceFields()
    addNodeInterfaceFields(tc)
    expect(tc.getFieldNames()).toEqual(expect.arrayContaining(fields))
  })

  it(`getNodeInterfaceFields`, () => {
    const fields = getNodeInterfaceFields()
    expect(fields).toEqual([`id`, `parent`, `children`, `internal`])
  })

  it(`hasNodeInterface`, () => {
    const withoutNodeInterfaceTC = TypeComposer.create(
      `type WithoutInterface { foo: Boolean }`
    )
    const withNodeInterfaceTC = TypeComposer.create(
      `type WithInterface implements Node { qux: Boolean }`
    )
    expect(hasNodeInterface(withoutNodeInterfaceTC)).toBeFalsy()
    expect(hasNodeInterface(withNodeInterfaceTC)).toBeTruthy()
  })
})
