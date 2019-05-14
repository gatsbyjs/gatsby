module.exports = {
  uuid: 0,
  nodes: [],
  get() {
    this.uuid += 1

    this.nodes = this.nodes.map(node =>
      Object.assign({}, node, {
        updates: node.updates + 1,
      })
    )

    const node = {
      updates: 0,
      uuid: this.uuid,
      title: `Hello World (${this.uuid})`,
      message: `
This is fake data to test Gatsby Preview.
What are you doing here, anyways? Be gone!

(also pretend this is randomized, it is not)

...

OK cool, I appreciate you. Thanks for checking deep into the underlying stuff, you pro.

We welcome any and all contributions! 💪
      `.trim(),
    }

    this.nodes.push(node)

    return this.nodes
  },
  reset() {
    this.nodes = []
    this.uuid = 0

    return this
  },
  update(uuid, newNode) {
    const index = this.nodes.findIndex(node => node.uuid === uuid)
    this.nodes.splice(index, 1, newNode)
    return newNode
  },
}
