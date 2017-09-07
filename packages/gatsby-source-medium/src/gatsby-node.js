const axios = require(`axios`)
const crypto = require(`crypto`)

const fetch = username => {
  const url = `https://medium.com/${username}/latest?format=json`
  return axios.get(url)
}

const prefix = `])}while(1);</x>`

const strip = payload => payload.replace(prefix, ``)

exports.sourceNodes = async ({ boundActionCreators }, { username }) => {
  const { createNode } = boundActionCreators

  try {
    const result = await fetch(username)
    const json = JSON.parse(strip(result.data))

    const { posts } = json.payload
    const collectionKeys = Object.keys(json.payload.references.Collection)
    const userKeys = Object.keys(json.payload.references.User)

    const importableResources = [
      userKeys.map(key => json.payload.references.User[key]),
      posts,
      collectionKeys.map(key => json.payload.references.Collection[key]),
    ]

    const resources = Array.prototype.concat(...importableResources)
    resources.map(resource => {
      const digest = crypto
        .createHash(`md5`)
        .update(JSON.stringify(resource))
        .digest(`hex`)

      const links =
        resource.type === `Post`
          ? {
              author___NODE: resource.creatorId,
            }
          : resource.type === `User`
            ? {
                posts___NODE: posts
                  .filter(post => post.creatorId === resource.userId)
                  .map(post => post.id),
              }
            : {}

      const node = Object.assign(
        resource,
        {
          id: resource.id ? resource.id : resource.userId,
          parent: `__SOURCE__`,
          children: [],
          internal: {
            type: `Medium${resource.type}`,
            contentDigest: digest,
          },
        },
        links
      )

      createNode(node)
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
