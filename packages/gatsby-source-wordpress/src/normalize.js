const crypto = require(`crypto`)
const deepMapKeys = require(`deep-map-keys`)
const _ = require(`lodash`)
const uuidv5 = require("uuid/v5")

const colorized = require(`./output-color`)
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
exports.createGraphQLNode = createGraphQLNode

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
exports.addFields = addFields

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
      colorized.out(
        `Object with key "${key}" breaks GraphQL naming convention. Renamed to "${nkey}"`,
        colorized.color.Font.FgRed
      )
    )

  return nkey
}

exports.getValidKey = getValidKey

// Create entities from the few the WordPress API returns as an object for presumably
// legacy reasons.
exports.normalizeEntities = entities => {
  const mapType = e =>
    Object.keys(e)
      .filter(key => key !== `__type`)
      .map(key => {
        return {
          id: key,
          ...e[key],
          __type: e.__type,
        }
      })
  return entities.reduce((acc, e) => {
    switch (e.__type) {
      case `wordpress__wp_types`:
        return acc.concat(mapType(e))
      case `wordpress__wp_statuses`:
        return acc.concat(mapType(e))
      case `wordpress__wp_taxonomies`:
        return acc.concat(mapType(e))
      case `wordpress__acf_options`:
        return acc.concat(mapType(e))
      default:
        return acc.concat(e)
    }
  }, [])
}

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
    Object.keys(e).forEach(key => {
      if (e[`${key}_gmt`]) {
        e[key] = new Date(e[`${key}_gmt`] + `z`).toJSON()
        delete e[`${key}_gmt`]
      }
    })

    return e
  })

// Lift "rendered" fields to top-level
exports.liftRenderedField = entities =>
  entities.map(e => {
    Object.keys(e).forEach(key => {
      const value = e[key]
      if (_.isObject(value) && value.rendered) {
        e[key] = value.rendered
      }
    })

    return e
  })

const seedConstant = `b2012db8-fafc-5a03-915f-e6016ff32086`
const typeNamespaces = {}
exports.createGatsbyIds = entities =>
  entities.map(e => {
    let namespace
    if (typeNamespaces[e.__type]) {
      namespace = typeNamespaces[e.__type]
    } else {
      typeNamespaces[e.__type] = uuidv5(e.__type, seedConstant)
      namespace = typeNamespaces[e.__type]
    }
    e.id = uuidv5(e.wordpress_id.toString(), namespace)
    return e
  })

// Build foreign reference map.
exports.mapTypes = entities => {
  const groups = _.groupBy(entities, e => e.__type)
  for (let groupId in groups) {
    groups[groupId] = groups[groupId].map(e => {
      return {
        wordpress_id: e.wordpress_id,
        id: e.id,
      }
    })
  }

  return groups
}

exports.mapAuthorsToUsers = entities => {
  const users = entities.filter(e => e.__type === `wordpress__wp_users`)
  return entities.map(e => {
    if (e.author) {
      // Find the user
      const user = users.find(u => u.wordpress_id === e.author)
      if (user) {
        e.author___NODE = user.id

        // Add a link to the user to the entity.
        if (!user.all_authored_entities___NODE) {
          user.all_authored_entities___NODE = []
        }
        user.all_authored_entities___NODE.push(e.id)
        if (!user[`authored_${e.__type}___NODE`]) {
          user[`authored_${e.__type}___NODE`] = []
        }
        user[`authored_${e.__type}___NODE`].push(e.id)

        delete e.author
      }
    }
    return e
  })
}

exports.mapPostsToTagsCategories = entities => {
  const tags = entities.filter(e => e.__type === `wordpress__TAG`)
  const categories = entities.filter(e => e.__type === `wordpress__CATEGORY`)

  return entities.map(e => {
    if (e.__type === `wordpress__POST`) {
      // Replace tags & categories with links to their nodes.
      e.tags___NODE = e.tags.map(
        t => tags.find(tObj => t === tObj.wordpress_id).id
      )
      delete e.tags

      e.categories___NODE = e.categories.map(
        c => categories.find(cObj => c === cObj.wordpress_id).id
      )
      delete e.categories
    }
    return e
  })
}

// TODO generalize this for all taxonomy types.
exports.mapTagsCategoriesToTaxonomies = entities => {
  const taxonomies = entities.filter(
    e => e.__type === `wordpress__wp_taxonomies`
  )

  return entities.map(e => {
    if (e.taxonomy) {
      // Replace taxonomy with a link to the taxonomy node.
      e.taxonomy___NODE = taxonomies.find(t => t.wordpress_id === e.taxonomy).id
      delete e.taxonomy
    }
    return e
  })
}

exports.mapEntitiesToMedia = entities => {
  const media = entities.filter(e => e.__type === `wordpress__wp_media`)
  return entities.map(e => {
    // acf.linked_image
    if (e.acf && e.acf.linked_image) {
      const me = media.find(m => m.source_url === e.acf.linked_image)
      e.acf.linked_image___NODE = me.id
      delete e.acf.linked_image
    }

    if (e.acf && e.acf.page_builder) {
      // Replace photo fields.
      // acf.page_builder[].photo
      // acf.page_builder[].pictures[].picture
      e.acf.page_builder = e.acf.page_builder.map(f => {
        if (f.photo) {
          f.photo___NODE = media.find(
            m => m.wordpress_id === f.photo.wordpress_id
          ).id
          delete f.photo
        }
        if (f.pictures) {
          f.pictures = f.pictures.map(p => {
            p.picture___NODE = media.find(
              m => m.wordpress_id === p.picture.wordpress_id
            ).id
            delete p.picture
            return p
          })
        }
        return f
      })
    }
    return e
  })
}

exports.createNodesFromEntities = ({ entities, createNode }) => {
  entities.forEach(e => {
    // Create subnodes for page_builder
    // find any "rendered" field and make that top-level
    // TODO download files for media nodes and set as local_file.
    let { __type, ...entity } = e
    let children = []
    // Create child nodes for acf.page_builder
    if (entity.acf && entity.acf.page_builder) {
      entity.acf.page_builder___NODE = entity.acf.page_builder.map((f, i) => {
        const type = `WordPressAcf_${f.acf_fc_layout}`
        delete f.acf_fc_layout
        const acfChildNode = {
          ...f,
          id: entity.id + i + type,
          parent: entity.id,
          children: [],
          internal: { type, contentDigest: digest(JSON.stringify(f)) },
        }
        createNode(acfChildNode)
        children.push(acfChildNode.id)
        return acfChildNode.id
      })
      delete entity.acf.page_builder
    }

    let node = {
      ...entity,
      children,
      parent: null,
      internal: {
        type: e.__type,
        contentDigest: digest(JSON.stringify(entity)),
      },
    }
    createNode(node)
  })
}

// Move *_gmt fields to be standard version as Gatsby assumes
// you pass in UTC dates.

exports.buildReferenceMap = async ({
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
