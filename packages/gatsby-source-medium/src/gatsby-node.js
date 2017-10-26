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

exports.sourceNodes = async ({ boundActionCreators }, { username }) => {
  const { createNode } = boundActionCreators

  try {
    const isPublication = username[0] !== `@`  // username's start with `@` symbol
    const result = await fetch(username)
    const json = JSON.parse(strip(result.data))
    let importableResources = []
    const userKeys = Object.keys(json.payload.references.User)
    if(!isPublication){
      const postKeys = Object.keys(json.payload.references.Post)
      importableResources = [
        userKeys.map(key => json.payload.references.User[key]),
        postKeys.map(key => json.payload.references.Post[key]),
      ]
    } else {
      const posts = json.payload.posts
      importableResources =  [
        posts,
        userKeys.map(key => json.payload.references.User[key]),
      ]
    }

    const resources = Array.prototype.concat(...importableResources)
    resources.map(resource => {
      convertTimestamps(resource)

      const digest = crypto
        .createHash(`md5`)
        .update(JSON.stringify(resource))
        .digest(`hex`)

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
      )

      createNode(node)
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
