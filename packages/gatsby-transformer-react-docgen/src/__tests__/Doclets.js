import { applyPropDoclets } from "../Doclets"

describe(`transformer-react-doc-gen: Doclets`, () => {
  it(`should apply @required`, () => {
    const doclets = {
      required: true,
    }
    expect(applyPropDoclets({ doclets })).toEqual({
      doclets,
      required: true,
    })
  })

  it(`should apply @required`, () => {
    const doclets = {
      defaultValue: `() => {}`,
    }
    expect(applyPropDoclets({ doclets })).toEqual({
      doclets,
      defaultValue: {
        value: `() => {}`,
        computed: false,
      },
    })
  })

  it(`should handle inline enum types`, () => {
    const doclets = {
      type: `{(true|'foo'|40|"bar")}`,
    }
    expect(applyPropDoclets({ doclets, type: {} })).toEqual({
      doclets,
      type: {
        name: `enum`,
        value: [
          { value: `true`, computed: false },
          { value: `'foo'`, computed: false },
          { value: `40`, computed: false },
          { value: `"bar"`, computed: false },
        ],
      },
    })
  })

  it(`should create a union type for none-literals`, () => {
    const doclets = {
      type: `{(string|func|bool)}`,
    }
    expect(applyPropDoclets({ doclets, type: {} })).toEqual({
      doclets,
      type: {
        name: `union`,
        value: [{ name: `string` }, { name: `func` }, { name: `bool` }],
      },
    })
  })
})
