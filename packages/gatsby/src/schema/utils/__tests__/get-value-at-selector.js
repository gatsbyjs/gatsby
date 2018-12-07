const getValueAtSelector = require(`../get-value-at-selector`)

const obj = {
  foo: {
    bar: {
      baz: `qux`,
    },
    baz: [`qux`],
  },
}

describe(`getValueAtSelector util`, () => {
  it(`returns value at nested selector`, () => {
    const value = getValueAtSelector(obj, `foo.bar.baz`)
    const expected = `qux`
    expect(value).toBe(expected)
  })

  // Maybe FIXME:
  // it(`handles arrays`, () => {
  //   const value = getValueAtSelector(obj, `foo.baz`)
  //   const expected = `qux`
  //   expect(value).toBe(expected)
  // })
})
