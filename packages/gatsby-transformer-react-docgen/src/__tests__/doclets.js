import { applyPropDoclets } from "../doclets"

describe(`transformer-react-doc-gen: Doclets`, () => {
  describe(`tsType`, () => {
    describe(`doclets: []`, () => {
      const doclets = []
      describe(`tsType: { name: string }`, () => {
        const tsType = {
          name: `string`,
        }

        it(`should replace the undefined type with the tsType (string) definition`, () => {
          expect(applyPropDoclets({ doclets, tsType })).toHaveProperty(
            `type`,
            expect.objectContaining({
              ...tsType,
            })
          )
        })
      })

      describe(`tsType: { name: union, raw: "number | any", elements: [[Object], [Object]] }`, () => {
        const tsType = {
          name: `union`,
          raw: `number | any`,
          elements: [[Object], [Object]],
        }

        it(`should replace the undefined type with the ts Union Type`, () => {
          expect(applyPropDoclets({ doclets, tsType })).toHaveProperty(
            `type`,
            expect.objectContaining({
              name: `union`,
              value: [
                {
                  name: `number`,
                },
                {
                  name: `any`,
                },
              ],
            })
          )
        })
      })

      describe(`tsType: { name: ReactComponent, raw: "React.Component<Props>", elements: [ [Object] ] }`, () => {
        const tsType = {
          name: `ReactComponent`,
          raw: `React.Component<Props>`,
          elements: [[Object]],
        }

        it(`should replace the undefined type with the ts Raw Type React.Component<Props>`, () => {
          expect(applyPropDoclets({ doclets, tsType })).toHaveProperty(
            `type`,
            expect.objectContaining({
              name: `React.Component<Props>`,
            })
          )
        })
      })
    })

    // Doclets differenz from ts type
    describe(`doclets: [{ tag: "type", value: "{number}" }]`, () => {
      const doclets = [{ tag: `type`, value: `{number}` }]
      describe(`tsType: { name: string }`, () => {
        const tsType = {
          name: `string`,
        }

        it(`doclet says number, typescript says string, doclet should win as default behavior`, () => {
          expect(applyPropDoclets({ doclets, tsType })).toHaveProperty(`type`, {
            name: `number`,
          })
        })
      })
    })
  })

  describe(`doclets`, () => {
    describe(`type`, () => {
      describe(`[ { tag: "type", value: "{string}" } ]`, () => {
        const doclets = [{ tag: `type`, value: `{string}` }]

        it(`should set { name: "string" } as type`, () => {
          expect(applyPropDoclets({ doclets })).toHaveProperty(
            `type`,
            expect.objectContaining({
              name: `string`,
            })
          )
        })
      })

      describe(`[ { tag: "type", value: "{React.Component<Props>}" } ]`, () => {
        const doclets = [{ tag: `type`, value: `{React.Component<Props>}` }]

        it(`should set { name: "React.Component<Props>" } as type`, () => {
          expect(applyPropDoclets({ doclets })).toHaveProperty(`type`, {
            name: `React.Component<Props>`,
          })
        })
      })

      describe(`[ { tag: "type", value: "{(number | any)}" } ]`, () => {
        const doclets = [{ tag: `type`, value: `{(number | any)}` }]

        it(`should set { name: "number | any" } as type`, () => {
          expect(applyPropDoclets({ doclets })).toHaveProperty(
            `type`,
            expect.objectContaining({
              name: `union`,
              value: [
                {
                  name: `number`,
                },
                {
                  name: `any`,
                },
              ],
            })
          )
        })
      })
    })
  })

  describe(`flowType`, () => {
    describe(`doclets: []`, () => {
      const doclets = []
      describe(`flowType: { name: string }`, () => {
        const flowType = {
          name: `string`,
        }

        it(`should replace the undefined type with the flowType (string) definition`, () => {
          expect(applyPropDoclets({ doclets, flowType })).toHaveProperty(
            `type`,
            expect.objectContaining({
              ...flowType,
            })
          )
        })
      })

      describe(`flowType: { name: union, raw: "number | any", elements: [[Object], [Object]] }`, () => {
        const flowType = {
          name: `union`,
          raw: `number | any`,
          elements: [[Object], [Object]],
        }

        it(`should replace the undefined type with the ts Union Type`, () => {
          expect(applyPropDoclets({ doclets, flowType })).toHaveProperty(
            `type`,
            expect.objectContaining({
              name: `union`,
              value: [
                {
                  name: `number`,
                },
                {
                  name: `any`,
                },
              ],
            })
          )
        })
      })

      describe(`flowType: { name: ReactComponent, raw: "React.Component<Props>", elements: [ [Object] ] }`, () => {
        const flowType = {
          name: `ReactComponent`,
          raw: `React.Component<Props>`,
          elements: [[Object]],
        }

        it(`should replace the undefined type with the ts Raw Type React.Component<Props>`, () => {
          expect(applyPropDoclets({ doclets, flowType })).toHaveProperty(
            `type`,
            expect.objectContaining({
              name: `React.Component<Props>`,
            })
          )
        })
      })
    })

    describe(`doclets: [{ tag: "type", value: "{number}" }]`, () => {
      const doclets = [{ tag: `type`, value: `{number}` }]
      describe(`flowType: { name: string }`, () => {
        const flowType = {
          name: `string`,
        }

        it(`doclet says number, typescript says string, doclet should win as default behauvior`, () => {
          expect(applyPropDoclets({ doclets, flowType })).toHaveProperty(
            `type`,
            {
              name: `number`,
            }
          )
        })
      })
    })
  })

  describe(`no types set `, () => {
    it(`should return an object with the propety "name" equal to "propertyName"`, () => {
      const doclets = [{ tag: `type`, value: `propertyName` }]
      const type = undefined

      expect(applyPropDoclets({ doclets, type })).toHaveProperty(
        `type`,
        expect.objectContaining({
          name: `propertyName`,
        })
      )
    })
  })

  it(`should apply @required`, () => {
    const doclets = [{ tag: `required`, value: true }]
    expect(applyPropDoclets({ doclets })).toEqual({
      doclets,
      required: true,
    })
  })

  it(`should apply @required`, () => {
    const doclets = [
      {
        tag: `defaultValue`,
        value: `() => {}`,
      },
    ]

    expect(applyPropDoclets({ doclets })).toEqual({
      doclets,
      defaultValue: {
        value: `() => {}`,
        computed: false,
      },
    })
  })

  it(`should handle inline enum types`, () => {
    const doclets = [
      {
        tag: `type`,
        value: `{(true|'foo'|40|"bar")}`,
      },
    ]

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
    const doclets = [
      {
        tag: `type`,
        value: `{(string|func|bool)}`,
      },
    ]

    expect(applyPropDoclets({ doclets, type: {} })).toEqual({
      doclets,
      type: {
        name: `union`,
        value: [{ name: `string` }, { name: `func` }, { name: `bool` }],
      },
    })
  })
})
