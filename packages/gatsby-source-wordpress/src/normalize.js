const crypto = require(`crypto`)
const deepMapKeys = require(`deep-map-keys`)
const _ = require(`lodash`)
const uuidv5 = require(`uuid/v5`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const colorized = require(`./output-color`)
const conflictFieldPrefix = `wordpress_`
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
const normalizeEntities = entities => {
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
      case `wordpress__wp_api_menus_menu_locations`:
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

exports.normalizeEntities = normalizeEntities

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
      if (_.isObject(value) && _.isString(value.rendered)) {
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
exports.mapTagsCategoriesToTaxonomies = entities =>
  entities.map(e => {
    // Where should api_menus stuff link to?
    if (e.taxonomy && e.__type !== `wordpress__wp_api_menus_menus`) {
      // Replace taxonomy with a link to the taxonomy node.
      e.taxonomy___NODE = entities.find(t => t.wordpress_id === e.taxonomy).id
      delete e.taxonomy
    }
    return e
  })

exports.mapEntitiesToMedia = entities => {
  const media = entities.filter(e => e.__type === `wordpress__wp_media`)
  return entities.map(e => {
    const hasPhoto = object => _.some(object, value => isPhoto(value))

    const isPhoto = field =>
      _.isObject(field) &&
      field.wordpress_id &&
      field.url &&
      field.width &&
      field.height
        ? true
        : false

    const photoRegex = /\.(gif|jpg|jpeg|tiff|png)$/i
    const isPhotoUrl = filename => photoRegex.test(filename)
    const replacePhoto = field =>
      media.find(m => m.wordpress_id === field.wordpress_id).id

    const replaceFieldsInObject = object => {
      _.each(object, (value, key) => {
        if (_.isArray(value)) {
          value.forEach(v => replaceFieldsInObject(v))
        }
        if (isPhoto(value)) {
          object[`${key}___NODE`] = replacePhoto(value)
          delete object[key]
        }
      })
    }

    if (e.acf) {
      _.each(e.acf, (value, key) => {
        if (_.isString(value) && isPhotoUrl(value)) {
          const me = media.find(m => m.source_url === value)
          e.acf[`${key}___NODE`] = me.id
          delete e.acf[key]
        }

        if (_.isArray(value) && value[0].acf_fc_layout) {
          e.acf[key] = e.acf[key].map(f => {
            replaceFieldsInObject(f)
            return f
          })
        }
      })
    }
    return e
  })
}

// Downloads media files and removes "sizes" data as useless in Gatsby context.
exports.downloadMediaFiles = async ({ entities, store, cache, createNode }) =>
  Promise.all(
    entities.map(async e => {
      let fileNode
      if (e.__type === `wordpress__wp_media`) {
        try {
          fileNode = await createRemoteFileNode({
            url: e.source_url,
            store,
            cache,
            createNode,
          })
        } catch (e) {
          // Ignore
        }
      }

      if (fileNode) {
        e.localFile___NODE = fileNode.id
        delete e.media_details.sizes
      }

      return e
    })
  )

const createACFChildNodes = (
  obj,
  entityId,
  topLevelIndex,
  type,
  children,
  createNode
) => {
  // Replace any child arrays with pointers to nodes
  _.each(obj, (value, key) => {
    if (_.isArray(value) && value[0].acf_fc_layout) {
      obj[`${key}___NODE`] = value.map(
        v =>
          createACFChildNodes(
            v,
            entityId,
            topLevelIndex,
            type + key,
            children,
            createNode
          ).id
      )
      delete obj[key]
    }
  })

  const acfChildNode = {
    ...obj,
    id: entityId + topLevelIndex + type,
    parent: entityId,
    children: [],
    internal: { type, contentDigest: digest(JSON.stringify(obj)) },
  }
  createNode(acfChildNode)
  children.push(acfChildNode.id)

  return acfChildNode
}

exports.createNodesFromEntities = ({ entities, createNode }) => {
  entities.forEach(e => {
    // Create subnodes for ACF Flexible layouts
    let { __type, ...entity } = e
    let children = []
    if (entity.acf) {
      _.each(entity.acf, (value, key) => {
        if (_.isArray(value) && value[0].acf_fc_layout) {
          entity.acf[`${key}_${entity.type}___NODE`] = entity.acf[
            key
          ].map((f, i) => {
            const type = `WordPressAcf_${f.acf_fc_layout}`
            delete f.acf_fc_layout

            const acfChildNode = createACFChildNodes(
              f,
              entity.id + i,
              key,
              type,
              children,
              createNode
            )

            return acfChildNode.id
          })

          delete entity.acf[key]
        }
      })
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
