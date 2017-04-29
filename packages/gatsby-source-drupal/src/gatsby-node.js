const axios = require("axios")
const crypto = require("crypto")
const _ = require("lodash")

const makeTypeName = type => {
  return `drupal__${type.replace(/-/g, "_")}`
}

const processEntities = ents => {
  return ents.map(ent => {
    const newEnt = {
      ...ent.attributes,
      id: ent.id,
      type: ent.type,
      created: new Date(ent.attributes.created * 1000).toJSON(),
      changed: new Date(ent.attributes.changed * 1000).toJSON(),
    }
    if (newEnt.revision_timestamp) {
      newEnt.revision_timestamp = new Date(
        newEnt.revision_timestamp * 1000
      ).toJSON()
    }

    return newEnt
  })
}

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
  updateSourcePluginStatus({
    plugin: `gatsby-source-drupal`,
    status: {
      ...store.getState().status["gatsby-source-drupal"],
      ready: false,
    },
  })

  // Touch existing Drupal nodes so Gatsby doesn't garbage collect them.
  // console.log(
  // "existing drupal nodes",
  // _.values(store.getState().nodes)
  // .filter(n => n.type.slice(0, 8) === `drupal__`)
  // .map(n => n.id)
  // )

  _.values(store.getState().nodes)
    .filter(n => n.type.slice(0, 8) === `drupal__`)
    .forEach(n => touchNode(n.id))

  // Fetch articles.
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

  let result
  try {
    result = await axios.get(url)
  } catch (e) {
    console.log("error fetching articles", e)
  }

  console.log("articles fetched", result.data.data.length)

  updateSourcePluginStatus({
    plugin: `gatsby-source-drupal`,
    status: {
      ...store.getState().status["gatsby-source-drupal"],
      lastFetched: new Date().toJSON(),
    },
  })

  console.timeEnd("fetch Drupal data")

  const nodes = processEntities(result.data.data)
  nodes.forEach((node, i) => {
    const nodeStr = JSON.stringify(node)

    const gatsbyNode = {
      ...node,
      parent: `__SOURCE__`,
      type: makeTypeName(node.type),
      children: [],
      content: nodeStr,
      author: result.data.data[i].relationships.uid.data.id,
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

  // Fetch users.
  const userUrl = `http://dev-gatsbyjs-d8.pantheonsite.io/jsonapi/user/user`
  const userResult = await axios.get(userUrl)
  const users = processEntities(userResult.data.data)
  const blue = await Promise.all(
    users.map((user, i) => {
      return new Promise(resolve => {
        const userStr = JSON.stringify(user)

        const gatsbyUser = {
          ...user,
          parent: `__SOURCE__`,
          type: makeTypeName(user.type),
          children: [],
          content: userStr,
          mediaType: `application/json`,
        }

        if (gatsbyUser.uid === 1) {
          return resolve()
        }

        axios
          .get(
            userResult.data.data[i].relationships.user_picture.links.related,
            { timeout: 3000 }
          )
          .catch(() => console.log("fail fetch", gatsbyUser))
          .then(pictureResult => {
            gatsbyUser.picture = `http://dev-gatsbyjs-d8.pantheonsite.io${pictureResult.data.data.attributes.url}`

            // Get content digest of node.
            const contentDigest = crypto
              .createHash("md5")
              .update(JSON.stringify(gatsbyUser))
              .digest("hex")

            gatsbyUser.contentDigest = contentDigest

            createNode(gatsbyUser)

            resolve()
          })
      })
    })
  )

  updateSourcePluginStatus({
    plugin: `gatsby-source-drupal`,
    status: {
      ...store.getState().status["gatsby-source-drupal"],
      ready: true,
    },
  })

  return
}
