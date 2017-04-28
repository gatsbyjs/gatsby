const axios = require("axios")
const Promise = require("bluebird")
const crypto = require("crypto")
const url = require("url")
const _ = require("lodash")

exports.sourceNodes = async ({
  boundActionCreators,
  getNode,
  hasNodeChanged,
  store,
}) => {
  const {
    createNode,
    updateSourcePluginStatus,
    touchNode,
  } = boundActionCreators
  console.log("inside gatsby-source-drupal")
  updateSourcePluginStatus({
    plugin: `gatsby-source-drupal`,
    status: {
      ...store.getState().status["gatsby-source-drupal"],
      ready: false,
    },
  })

  // Touch existing Drupal nodes so Gatsby doesn't garbage collect them.
  console.log(
    "existing drupal nodes",
    _.values(store.getState().nodes)
      .filter(n => n.type.slice(0, 8) === `drupal__`)
      .map(n => n.id)
  )

  _.values(store.getState().nodes)
    .filter(n => n.type.slice(0, 8) === `drupal__`)
    .forEach(n => touchNode(n.id))

  // Do the initial fetch
  console.time("fetch Drupal data")
  console.log("Starting to fetch data from Drupal")

  const lastFetched = store.getState().status["gatsby-source-drupal"]
    .lastFetched

  let url
  if (lastFetched) {
    url = `http://dev-gatsbyjs-d8.pantheonsite.io/jsonapi/node/article?filter[new-content][path]=changed&filter[new-content][value]=${parseInt(new Date(lastFetched).getTime() / 1000).toFixed(0)}&filter[new-content][operator]=%3E&page[offset]=0&page[limit]=10`
  } else {
    url = `http://dev-gatsbyjs-d8.pantheonsite.io/jsonapi/node/article`
  }

  const result = await axios.get(url)

  console.log("articles fetched", result.data.data.length)

  updateSourcePluginStatus({
    plugin: `gatsby-source-drupal`,
    status: {
      ...store.getState().status["gatsby-source-drupal"],
      lastFetched: new Date().toJSON(),
    },
  })

  console.timeEnd("fetch Drupal data")

  result.data.data.forEach((node, i) => {
    // We don't need this information locally.
    delete node.relationships
    // console.log(node)
    const newNode = {
      id: node.id,
      type: node.type,
      ...node.attributes,
    }

    newNode.created = new Date(newNode.created * 1000).toJSON()
    newNode.changed = new Date(newNode.changed * 1000).toJSON()
    newNode.revision_timestamp = new Date(
      newNode.revision_timestamp * 1000
    ).toJSON()
    const nodeStr = JSON.stringify(newNode)

    const gatsbyNode = {
      ...newNode,
      parent: `__SOURCE__`,
      type: `drupal__${node.type.replace(/-/g, "_")}`,
      children: [],
      content: nodeStr,
      mediaType: `application/json`,
    }

    // Get content digest of node.
    const contentDigest = crypto
      .createHash("md5")
      .update(JSON.stringify(gatsbyNode))
      .digest("hex")

    gatsbyNode.contentDigest = contentDigest

    createNode(gatsbyNode)
  })

  updateSourcePluginStatus({
    plugin: `gatsby-source-drupal`,
    status: {
      ...store.getState().status["gatsby-source-drupal"],
      ready: true,
    },
  })

  return
}
