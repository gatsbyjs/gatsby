const { nodeFromData } = require(`../normalize`)
const { idOverlayExample } = require(`./data.json`)

describe(`node completion`, () => {
  it(`should correctly generate node from jsonapi`, () => {
    const node = nodeFromData(idOverlayExample, id => id)
    expect(node.bundle).toEqual(idOverlayExample.attributes.bundle)
    expect(node._attributes_id).toEqual(idOverlayExample.attributes.id)
  })
})
