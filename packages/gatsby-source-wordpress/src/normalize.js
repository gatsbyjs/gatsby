const conflictFieldPrefix = `wordpress_`
// restrictedNodeFields from here https://www.gatsbyjs.org/docs/node-interface/
const restrictedNodeFields = [`id`, `children`, `parent`, `fields`, `internal`]

let _parentChildNodes = []

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

  if (type === refactoredEntityTypes.post) {
    node.id = `POST_${ent.id.toString()}`
    node.internal.type = refactoredEntityTypes.post
  } else if (type === refactoredEntityTypes.page) {
    node.id = `PAGE_${ent.id.toString()}`
    node.internal.type = refactoredEntityTypes.page
  } else if (type === refactoredEntityTypes.tag) {
    node.id = `TAG_${ent.id.toString()}`
    node.internal.type = refactoredEntityTypes.tag
  } else if (type === refactoredEntityTypes.category) {
    node.id = `CATEGORY_${ent.id.toString()}`
    node.internal.type = refactoredEntityTypes.category
  }

  node = addFields(ent, node, createNode)

  if (
    type === refactoredEntityTypes.post ||
    type === refactoredEntityTypes.page
  ) {
    // TODO : Move this to field recursive and add other fields that have rendered field
    node.title = ent.title.rendered
    node.content = ent.content.rendered
    node.excerpt = ent.excerpt.rendered
  }

  // Download any remote URLs and replace them with reference to
  // downloaded file node.
  await Promise.all(
    Object.keys(node).map(async key => {
      if (_.isString(node[key])) {
        const parts = path.parse(node[key])
        if (parts.ext !== ``) {
          let fileNode = { id: null }
          try {
            fileNode = await createRemoteFileNode({
              url: node[key],
              store,
              cache,
              createNode,
            })
          } catch (e) {
            // Ignore
          }
          node[`${key}_local_file___NODE`] = fileNode.id
        }
      }
    })
  )

  node.internal.content = JSON.stringify(node)
  node.internal.contentDigest = digest(stringify(node))
  createNode(node)
}

/**
 * Loop through fields to validate naming conventions and extract child nodes.
 *
 * @param {any} ent
 * @param {any} newEnt
 * @param {function} createNode
 * @returns the new entity with fields
 */
function addFields(ent, newEnt, createNode, store, cache) {
  newEnt = recursiveAddFields(ent, newEnt)

  // TODO : add other types of child nodes
  if (_useACF && ent.acf != undefined && ent.acf != `false`) {
    // Create a child node with acf field json.
    const acfNode = {
      id: `${newEnt.id}_ACF_Field`,
      children: [],
      parent: newEnt.id,
      internal: {
        type: `${typePrefix}ACF_Field`,
        content: JSON.stringify(ent.acf),
      },
    }
    acfNode.internal.contentDigest = digest(stringify(acfNode))
    createNode(acfNode)
    _parentChildNodes.push({ parentId: newEnt.id, childNodeId: acfNode.id })
  } else if (newEnt.meta && newEnt.meta.links && newEnt.meta.links.self) {
    console.log(newEnt.meta)
    //The entity as a link to more content for this entity
    fetchData({
      route: {
        url: newEnt.meta.links.self,
        type: `${newEnt.internal.type}_Extended`,
      },
      createNode,
      store,
      cache,
      _verbose,
      _perPage,
      _hostingWPCOM,
      _accessToken,
    })
  }
  return newEnt
}

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
      let key = getValidName(k)
      if (key !== `acf`) {
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
  }
  return newEnt
}

/**
 * Validate the GraphQL naming convetions & protect specific fields.
 *
 * @param {any} key
 * @returns the valid name
 */
function getValidName(key) {
  let nkey = key
  const NAME_RX = /^[_a-zA-Z][_a-zA-Z0-9]*$/
  if (!NAME_RX.test(nkey) || restrictedNodeFields.includes(nkey)) {
    nkey = `${conflictFieldPrefix}${nkey}`.replace(/-|__|:|\.|\s/g, `_`)
    if (_verbose)
      console.log(
        colorized.out(
          `Object with key "${key}" breaks GraphQL naming convention. Renamed to "${nkey}"`,
          colorized.color.Font.FgRed
        )
      )
  }
  return nkey
}

module.exports = async ({
  entities,
  typePrefix,
  _verbose,
  refactoredEntityTypes,
}) => {
  console.log(JSON.stringify(entities, null, 4))
  return
}

// TODOs
// * just use date_gmt & modified_gmt since we expect UTC/GMT dates.
// * discard most information about photos since a lot of it is for giving you
// different sizes
// * Maybe delete unusable links pointing back to the wordpress site.
