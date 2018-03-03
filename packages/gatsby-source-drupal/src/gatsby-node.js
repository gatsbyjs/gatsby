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
  { actions, getNode, hasNodeChanged, store, cache },
  { baseUrl, apiBase, createNodeId }
) => {
  const { createNode } = actions

  // Default apiBase to `jsonapi`
  apiBase = apiBase || `jsonapi`

  // Touch existing Drupal nodes so Gatsby doesn't garbage collect them.
  // _.values(store.getState().nodes)
  // .filter(n => n.internal.type.slice(0, 8) === `drupal__`)
  // .forEach(n => touchNode(n.id))

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

  const data = await axios.get(`${baseUrl}/${apiBase}`)
  const allData = await Promise.all(
    _.map(data.data.links, async (url, type) => {
      if (type === `self`) return
      if (!url) return
      if (!type) return
      const getNext = async (url, data = []) => {
        const d = await axios.get(url)
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
  _.each(allData, contentType => {
    if (!contentType) return
    _.each(contentType.data, datum => {
      if (datum.relationships) {
        _.each(datum.relationships, (v, k) => {
          if (!v.data) return
          if (ids[v.data.id]) {
            if (!backRefs[v.data.id]) {
              backRefs[v.data.id] = []
            }
            backRefs[v.data.id].push({ id: datum.id, type: datum.type })
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
      const node = nodeFromData(datum)

      // Add relationships
      if (datum.relationships) {
        node.relationships = {}
        _.each(datum.relationships, (v, k) => {
          if (!v.data) return
          if (ids[v.data.id]) {
            node.relationships[`${k}___NODE`] = v.data.id
          }
          // Add back reference relationships.
          if (backRefs[datum.id]) {
            backRefs[datum.id].forEach(
              ref => (node.relationships[`${ref.type}___NODE`] = ref.id)
            )
          }
        })
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
          // Resolve w/ baseUrl if node.uri isn't absolute.
          const url = new URL(node.url, baseUrl)
          fileNode = await createRemoteFileNode({
            url: url.href,
            store,
            cache,
            createNode,
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
