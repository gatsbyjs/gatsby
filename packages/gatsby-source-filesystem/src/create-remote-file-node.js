const fs = require("fs-extra")
const got = require("got")
const crypto = require("crypto")
const path = require(`path`)

const { createFileNode } = require(`./create-file-node`)
const cacheId = url => `create-remote-file-node-${url}`

module.exports = ({ url, store, cache }) => {
  return new Promise(async resolve => {
    if (!url) {
      return resolve()
    }
    fs.ensureDirSync(
      path.join(
        store.getState().program.directory,
        `.cache`,
        `gatsby-source-filesystem`
      )
    )
    const cachedHeaders = await cache.get(cacheId(url))
    const headers = {}
    if (cachedHeaders && cachedHeaders.etag) {
      headers["If-None-Match"] = cachedHeaders.etag
    }
    const response = await got(url, { headers })
    const digest = crypto.createHash("md5").update(url).digest("hex")
    const filename = path.join(
      store.getState().program.directory,
      `.cache`,
      `gatsby-source-filesystem`,
      digest + path.parse(url).ext
    )
    cache.set(cacheId(url), response.headers)
    if (response.statusCode === 200) {
      fs.writeFileSync(filename, response.body)
    }
    createFileNode(filename, {}, (err, fileNode) => {
      resolve(fileNode)
    })
  })
}
