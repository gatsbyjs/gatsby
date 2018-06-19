const axios = require(`axios`)
const crypto = require(`crypto`)

const fetch = username => {
  const url = `https://medium.com/${username}/latest?format=json`
  return axios.get(url)
}

const prefix = `])}while(1);</x>`

const convertTimestamps = (nextObj, prevObj, prevKey) => {
  if (typeof nextObj === `object`) {
    Object.keys(nextObj).map(key =>
      convertTimestamps(nextObj[key], nextObj, key)
    )
  } else {
    if (typeof nextObj === `number` && nextObj >> 0 !== nextObj) {
      const date = new Date(nextObj)
      if (date.getTime() === nextObj) {
        prevObj[prevKey] = date.toISOString().slice(0, 10)
      }
    }
  }
}

const strip = payload => payload.replace(prefix, ``)

exports.sourceNodes = async ({ actions, createNodeId }, { username }) => {
  const { createNode } = actions

  try {
    const result = await fetch(username)
    const json = JSON.parse(strip(result.data))

    let importableResources = []
    let posts = {} // because `posts` needs to be in a scope accessible by `links` below

    const users = Object.keys(json.payload.references.User).map(
      key => json.payload.references.User[key]
    )
    importableResources = importableResources.concat(users)

    if (json.payload.posts) {
      posts = json.payload.posts
      importableResources = importableResources.concat(posts)
    }

    if (json.payload.references.Post) {
      posts = Object.keys(json.payload.references.Post).map(
        key => json.payload.references.Post[key]
      )
      importableResources = importableResources.concat(posts)
    }

    if (json.payload.references.Collection) {
      const collections = Object.keys(json.payload.references.Collection).map(
        key => json.payload.references.Collection[key]
      )
      importableResources = importableResources.concat(collections)
    }

    const resources = Array.prototype.concat(...importableResources)
    resources.map(resource => {
      convertTimestamps(resource)

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
          id: createNodeId(resource.id ? resource.id : resource.userId),
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
