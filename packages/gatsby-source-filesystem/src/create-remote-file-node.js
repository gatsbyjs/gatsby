const fs = require(`fs-extra`)
const got = require(`got`)
const crypto = require(`crypto`)
const path = require(`path`)

const { createFileNode } = require(`./create-file-node`)
const cacheId = url => `create-remote-file-node-${url}`

module.exports = ({ url, store, cache, createNode }) =>
  new Promise(async (resolve, reject) => {
    if (!url) {
      return resolve()
    }

    // Ensure our cache directory exists.
    await fs.ensureDir(
      path.join(
        store.getState().program.directory,
        `.cache`,
        `gatsby-source-filesystem`
      )
    )

    // See if there's response headers for this url
    // from a previous request.
    const cachedHeaders = await cache.get(cacheId(url))
    const headers = {}
    if (cachedHeaders && cachedHeaders.etag) {
      headers[`If-None-Match`] = cachedHeaders.etag
    }

    // Create the temp and permanent file names for the url.
    const digest = crypto
      .createHash(`md5`)
      .update(url)
      .digest(`hex`)
    const tmpFilename = path.join(
      store.getState().program.directory,
      `.cache`,
      `gatsby-source-filesystem`,
      `tmp-` + digest + path.parse(url).ext
    )
    const filename = path.join(
      store.getState().program.directory,
      `.cache`,
      `gatsby-source-filesystem`,
      digest + path.parse(url).ext
    )

    // Fetch the file.
    const responseStream = got.stream(url, { headers })
    responseStream.pipe(fs.createWriteStream(tmpFilename))

    // If there's a 400/500 response or other error.
    responseStream.on(`error`, (error, body, response) => {
      fs.removeSync(tmpFilename)
      reject(error, body, response)
    })

    // If the status code is 200, move the piped temp file to the real name.
    // Else if 304, remove the empty response.
    responseStream.on(`response`, response => {
      cache.set(cacheId(url), response.headers)
      if (response.statusCode === 200) {
        fs.moveSync(tmpFilename, filename, { overwrite: true })
      } else {
        fs.removeSync(tmpFilename)
      }

      // Create the file node and return.
      createFileNode(filename, {}).then(fileNode => {
        createNode(fileNode)
        resolve(fileNode)
      })
    })
  })
