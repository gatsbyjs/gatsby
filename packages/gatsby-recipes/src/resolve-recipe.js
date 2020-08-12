const fs = require(`fs-extra`)
const path = require(`path`)
const isUrl = require(`is-url`)
const fetch = require(`node-fetch`)

const isRelative = path => {
  if (path.slice(0, 1) == `.`) {
    return true
  }

  return false
}

module.exports = async (pathOrUrl, projectRoot) => {
  let recipePath
  if (isUrl(pathOrUrl)) {
    const res = await fetch(pathOrUrl)
    const src = await res.text()
    return src
  }
  if (isRelative(pathOrUrl)) {
    recipePath = path.join(projectRoot, pathOrUrl)
  } else {
    const url = `https://unpkg.com/gatsby-recipes/recipes/${pathOrUrl}`
    const res = await fetch(url.endsWith(`.mdx`) ? url : url + `.mdx`)

    if (res.status !== 200) {
      throw new Error(
        JSON.stringify({
          fetchError: `Could not fetch ${pathOrUrl} from official recipes`,
        })
      )
    }

    const src = await res.text()
    return src
  }
  if (recipePath.slice(-4) !== `.mdx`) {
    recipePath += `.mdx`
  }

  const src = await fs.readFile(recipePath, `utf8`)
  return src
}
