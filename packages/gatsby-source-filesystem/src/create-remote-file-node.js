const fs = require(`fs-extra`)
const got = require(`got`)
const crypto = require(`crypto`)
const path = require(`path`)

const { createFileNode } = require(`./create-file-node`)
const cacheId = url => `create-remote-file-node-${url}`

module.exports = async ({ url, store, cache, createNode }) => {
  if (!url) return

  await fs.ensureDir(
    path.join(
      store.getState().program.directory,
      `.cache`,
      `gatsby-source-filesystem`
    )
  )

  const cachedHeaders = await cache.get(cacheId(url))
  const headers = {}
  if (cachedHeaders && cachedHeaders.etag) {
    headers[`If-None-Match`] = cachedHeaders.etag
  }

  let response = await got(url, { headers })

  const digest = crypto
    .createHash(`md5`)
    .update(url)
    .digest(`hex`)

  const filename = path.join(
    store.getState().program.directory,
    `.cache`,
    `gatsby-source-filesystem`,
    digest + path.parse(url).ext
  )
  cache.set(cacheId(url), response.headers)
  if (response.statusCode === 200) {
    await fs.writeFile(filename, response.body)
  }

  const fileNode = await createFileNode(filename)
  createNode(fileNode)
}
