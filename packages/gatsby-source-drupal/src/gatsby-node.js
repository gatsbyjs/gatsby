const axios = require(`axios`)
const crypto = require(`crypto`)
const _ = require(`lodash`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const { URL } = require(`url`)
const { nodeFromData } = require(`./normalize`)

// Get content digest of node.
const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`)

exports.sourceNodes = async (
  { actions, getNode, hasNodeChanged, store, cache, createNodeId },
  { baseUrl, apiBase, basicAuth }
) => {
  const { createNode } = actions

  // Default apiBase to `jsonapi`
  apiBase = apiBase || `jsonapi`

  // Touch existing Drupal nodes so Gatsby doesn't garbage collect them.
  // _.values(store.getState().nodes)
  // .filter(n => n.internal.type.slice(0, 8) === `drupal__`)
  // .forEach(n => touchNode({ nodeId: n.id }))

  // Fetch articles.
  // console.time(`fetch Drupal data`)
  console.log(`Starting to fetch data from Drupal`)

  // TODO restore this
  // let lastFetched
  // if (
  // store.getState().status.plugins &&
  // store.getState().status.plugins[`gatsby-source-drupal`]
  // ) {
  // lastFetched = store.getState().status.plugins[`gatsby-source-drupal`].status
  // .lastFetched
  // }

  const data = await axios.get(`${baseUrl}/${apiBase}`, { auth: basicAuth })
  const allData = await Promise.all(
    _.map(data.data.links, async (url, type) => {
      if (type === `self`) return
      if (!url) return
      if (!type) return
      const getNext = async (url, data = []) => {
        if (typeof url === `object`) {
          // url can be string or object containing href field
          url = url.href
        }

        let d
        try {
          d = await axios.get(url, { auth: basicAuth })
        } catch (error) {
          if (error.response && error.response.status == 405) {
            // The endpoint doesn't support the GET method, so just skip it.
            return []
          } else {
            console.error(`Failed to fetch ${url}`, error.message)
            console.log(error.data)
            throw error
          }
        }
        data = data.concat(d.data.data)
        if (d.data.links.next) {
          data = await getNext(d.data.links.next, data)
        }

        return data
      }

      const data = await getNext(url)

      const result = {
        type,
        data,
      }

      // eslint-disable-next-line consistent-return
      return result
    })
  )

  // Make list of all IDs so we can check against that when creating
  // relationships.
  const ids = {}
  _.each(allData, contentType => {
    if (!contentType) return
    _.each(contentType.data, datum => {
      ids[datum.id] = true
    })
  })

  // Create back references
  const backRefs = {}

  /**
   * Adds back reference to linked entity, so we can later
   * add node link.
   */
  const addBackRef = (linkedId, sourceDatum) => {
    if (ids[linkedId]) {
      if (!backRefs[linkedId]) {
        backRefs[linkedId] = []
      }
      backRefs[linkedId].push({
        id: sourceDatum.id,
        type: sourceDatum.type,
      })
    }
  }

  _.each(allData, contentType => {
    if (!contentType) return
    _.each(contentType.data, datum => {
      if (datum.relationships) {
        _.each(datum.relationships, (v, k) => {
          if (!v.data) return

          if (_.isArray(v.data)) {
            v.data.forEach(data => addBackRef(data.id, datum))
          } else {
            addBackRef(v.data.id, datum)
          }
        })
      }
    })
  })

  // Process nodes
  const nodes = []
  _.each(allData, contentType => {
    if (!contentType) return

    _.each(contentType.data, datum => {
      const node = nodeFromData(datum, createNodeId)

      node.relationships = {}

      // Add relationships
      if (datum.relationships) {
        _.each(datum.relationships, (v, k) => {
          if (!v.data) return
          if (_.isArray(v.data) && v.data.length > 0) {
            // Create array of all ids that are in our index
            node.relationships[`${k}___NODE`] = _.compact(
              v.data.map(data => (ids[data.id] ? createNodeId(data.id) : null))
            )
          } else if (ids[v.data.id]) {
            node.relationships[`${k}___NODE`] = createNodeId(v.data.id)
          }
        })
      }

      // Add back reference relationships.
      // Back reference relationships will need to be arrays,
      // as we can't control how if node is referenced only once.
      if (backRefs[datum.id]) {
        backRefs[datum.id].forEach(ref => {
          if (!node.relationships[`${ref.type}___NODE`]) {
            node.relationships[`${ref.type}___NODE`] = []
          }

          node.relationships[`${ref.type}___NODE`].push(createNodeId(ref.id))
        })
      }

      if (_.isEmpty(node.relationships)) {
        delete node.relationships
      }

      node.internal.contentDigest = createContentDigest(node)
      nodes.push(node)
    })
  })

  // Download all files.
  await Promise.all(
    nodes.map(async node => {
      let fileNode
      if (
        node.internal.type === `files` ||
        node.internal.type === `file__file`
      ) {
        try {
          let fileUrl = node.url
          if (typeof node.uri === `object`) {
            // Support JSON API 2.x file URI format https://www.drupal.org/node/2982209
            fileUrl = node.uri.url
          }
          // Resolve w/ baseUrl if node.uri isn't absolute.
          const url = new URL(fileUrl, baseUrl)
          // If we have basicAuth credentials, add them to the request.
          const auth =
            typeof basicAuth === `object`
              ? {
                  htaccess_user: basicAuth.username,
                  htaccess_pass: basicAuth.password,
                }
              : {}
          fileNode = await createRemoteFileNode({
            url: url.href,
            store,
            cache,
            createNode,
            createNodeId,
            auth,
          })
        } catch (e) {
          // Ignore
        }
        if (fileNode) {
          node.localFile___NODE = fileNode.id
        }
      }
    })
  )

  nodes.forEach(n => createNode(n))
}
