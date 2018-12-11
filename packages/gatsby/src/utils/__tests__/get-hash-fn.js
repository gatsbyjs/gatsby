const getHashFn = require(`../get-hash-fn`)

describe(`Test hashing function`, () => {
  it(`default parameters`, () => {
    const hash = getHashFn({})(`my input`)
    expect(hash).toMatchSnapshot()
  })
  it(`guards against collisions`, () => {
    const hash = getHashFn({})(`my input`)
    try {
      getHashFn({ cache: new Set([hash]) })(`my input`)
    } catch (err) {
      expect(err).toMatchSnapshot()
    }
  })
})
