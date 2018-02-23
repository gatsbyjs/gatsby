const { nodeFromData } = require(`../normalize`)
const { idOverlayExample } = require(`./data.json`)

describe(`node completion`, () => {
  it(`should preserve the node ID from jsonapi`, () => {
    const node = nodeFromData(idOverlayExample)
    expect(node.id).toEqual(idOverlayExample.id)
    expect(node.bundle).toEqual(idOverlayExample.attributes.bundle)
    expect(node._attributes_id).toEqual(idOverlayExample.attributes.id)
  })
})
