const crypto = require(`crypto`)
const deepMapKeys = require(`deep-map-keys`)
const stringify = require(`json-stringify-safe`)

const conflictFieldPrefix = `lever_`
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

/**
 * Encrypts a String using md5 hash of hexadecimal digest.
 *
 * @param {any} str
 */
const digest = str =>
  crypto
    .createHash(`md5`)
    .update(str)
    .digest(`hex`)

/**
 * Create the Graph QL Node
 *
 * @param {any} ent
 * @param {any} type
 * @param {any} createNode
 */
async function createGraphQLNode(ent, type, createNode, store, cache) {
  let id = !ent.id ? (!ent.ID ? 0 : ent.ID) : ent.id
  let node = {
    id: `${type}_${id.toString()}`,
    children: [],
    parent: null,
    internal: {
      type: type,
    },
  }
  node = recursiveAddFields(ent, node, createNode)
  node.internal.content = JSON.stringify(node)
  node.internal.contentDigest = digest(stringify(node))
  createNode(node)
}
exports.createGraphQLNode = createGraphQLNode

/**
 * Add fields recursively
 *
 * @param {any} ent
 * @param {any} newEnt
 * @returns the new node
 */
function recursiveAddFields(ent, newEnt) {
  for (let k of Object.keys(ent)) {
    if (!newEnt.hasOwnProperty(k)) {
      let key = getValidKey(k)
      newEnt[key] = ent[k]
      // Nested Objects & Arrays of Objects
      if (typeof ent[key] === `object`) {
        if (!Array.isArray(ent[key]) && ent[key] != null) {
          newEnt[key] = recursiveAddFields(ent[key], {})
        } else if (Array.isArray(ent[key])) {
          if (ent[key].length > 0 && typeof ent[key][0] === `object`) {
            ent[k].map((el, i) => {
              newEnt[key][i] = recursiveAddFields(el, {})
            })
          }
        }
      }
    }
  }
  return newEnt
}
exports.recursiveAddFields = recursiveAddFields

/**
 * Validate the GraphQL naming convetions & protect specific fields.
 *
 * @param {any} key
 * @returns the valid name
 */
function getValidKey({ key, verbose = false }) {
  let nkey = String(key)
  const NAME_RX = /^[_a-zA-Z][_a-zA-Z0-9]*$/
  let changed = false
  // Replace invalid characters
  if (!NAME_RX.test(nkey)) {
    changed = true
    nkey = nkey.replace(/-|__|:|\.|\s/g, `_`)
  }
  // Prefix if first character isn't a letter.
  if (!NAME_RX.test(nkey.slice(0, 1))) {
    changed = true
    nkey = `${conflictFieldPrefix}${nkey}`
  }
  if (restrictedNodeFields.includes(nkey)) {
    changed = true
    nkey = `${conflictFieldPrefix}${nkey}`.replace(/-|__|:|\.|\s/g, `_`)
  }
  if (changed && verbose)
    console.log(
      `Object with key "${key}" breaks GraphQL naming convention. Renamed to "${nkey}"`
    )

  return nkey
}

exports.getValidKey = getValidKey

// Create entities from the few the lever API returns as an object for presumably
// legacy reasons.
exports.normalizeEntities = entities =>
  entities.reduce((acc, e) => acc.concat(e), [])

// Standardize ids + make sure keys are valid.
exports.standardizeKeys = entities =>
  entities.map(e =>
    deepMapKeys(
      e,
      key => (key === `ID` ? getValidKey({ key: `id` }) : getValidKey({ key }))
    )
  )

// Standardize dates on ISO 8601 version.
exports.standardizeDates = entities =>
  entities.map(e => {
    if (e.createdAt) {
      e.createdAt = new Date(e.createdAt).toJSON()
    }
    return e
  })

exports.createGatsbyIds = (createNodeId, entities) =>
  entities.map(e => {
    e.id = createNodeId(e.lever_id.toString())
    return e
  })

exports.createNodesFromEntities = ({ entities, createNode }) => {
  entities.forEach(e => {
    let { ...entity } = e
    let node = {
      ...entity,
      parent: null,
      children: [],
      internal: {
        type: `lever`,
        contentDigest: digest(JSON.stringify(entity)),
      },
    }
    createNode(node)
  })
}
