const fs = require(`fs`)
const util = require(`util`)
const path = require(`path`)

const NODE_TYPE = `PincData`

const readFile = file =>
  util
    .promisify(fs.readFile)(file, `utf8`)
    .then(contents => JSON.parse(contents))
    .catch(() => [])

const writeFile = (file, contents) =>
  util
    .promisify(fs.writeFile)(file, JSON.stringify(contents), `utf8`)
    .catch(() => null)

const difference = (updated, existing) => {
  const lookup = updated.reduce((merged, node) => {
    merged[node.uuid] = node
    return merged
  }, {})
  return existing.filter(node => !lookup[node.uuid])
}

const getNode = (data, { createNodeId, createContentDigest }) => {
  const nodeContent = JSON.stringify(data)

  const meta = {
    id: createNodeId(`pinc-data-${data.uuid}`),
    parent: null,
    children: [],
    internal: {
      type: NODE_TYPE,
      content: nodeContent,
      contentDigest: createContentDigest(data),
    },
  }

  return Object.assign({}, data, meta)
}

const max = nodes =>
  nodes.reduce((maxValue, node) => {
    if (node.uuid > maxValue) {
      return node.uuid
    }
    return maxValue
  }, 0)

module.exports = {
  dbFilePath: path.join(__dirname, `db.json`),
  nodeType: NODE_TYPE,
  nodes: [],
  addNode(node) {
    this.nodes = this.nodes.concat(node)
    return node
  },
  async sync(helpers) {
    // empty array
    const nodes = await readFile(this.dbFilePath)

    const uuid = max(nodes) + 1

    const node = getNode(
      {
        updates: 0,
        uuid,
        title: `Hello World (${uuid})`,
        message: `
This is PINC data to test Gatsby Preview.
What are you doing here, anyways? Be gone!

(also pretend this is randomized, it is not)

...

OK cool, I appreciate you. Thanks for checking deep into the underlying stuff, you pro.

We welcome any and all contributions! 💪
      `.trim(),
      },
      helpers
    )

    const existing = this.nodes.slice(0)

    const updated = (this.nodes = nodes
      .slice(0)
      .map(node =>
        getNode(
          Object.assign({}, node, {
            updates: node.updates + 1,
          }),
          helpers
        )
      )
      .concat(node))

    await writeFile(this.dbFilePath, updated)

    return [updated, difference(updated, existing)]
  },
  async reset() {
    return writeFile(this.dbFilePath, [])
  },
}

module.exports.getNode = getNode
