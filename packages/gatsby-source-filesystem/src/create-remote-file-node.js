const fs = require(`fs-extra`)
const got = require(`got`)
const crypto = require(`crypto`)
const path = require(`path`)
const { isWebUri } = require(`valid-url`)

const { createFileNode } = require(`./create-file-node`)
const cacheId = url => `create-remote-file-node-${url}`

/**
 * Index of promises resolving to File node from remote url
 */
const processingCache = {}

module.exports = ({ url, store, cache, createNode, auth = {} }) => {
  // Check if we already requested node for this remote file
  // and return stored promise if we did.
  if (processingCache[url]) {
    return processingCache[url]
  }

  return (processingCache[url] = new Promise(async (resolve, reject) => {
    if (!url || isWebUri(url) === undefined) {
      resolve()
      return
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

    // Add htaccess authentication if passed in. This isn't particularly
    // extensible. We should define a proper API that we validate.
    if (auth && auth.htaccess_pass && auth.htaccess_user) {
      headers.auth = `${auth.htaccess_user}:${auth.htaccess_pass}`
    }

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
    let statusCode
    let responseHeaders
    let responseError = false
    const responseStream = got.stream(url, headers)
    responseStream.pipe(fs.createWriteStream(tmpFilename))
    responseStream.on(`downloadProgress`, pro => console.log(pro))

    // If there's a 400/500 response or other error.
    responseStream.on(`error`, (error, body, response) => {
      responseError = true
      fs.removeSync(tmpFilename)
      reject(error, body, response)
    })

    // If the status code is 200, move the piped temp file to the real name.
    // Else if 304, remove the empty response.
    responseStream.on(`response`, response => {
      statusCode = response.statusCode
      responseHeaders = response.headers
    })

    responseStream.on(`end`, response => {
      if (responseError) return

      // Save the response headers for future requests.
      cache.set(cacheId(url), responseHeaders)
      if (statusCode === 200) {
        fs.moveSync(tmpFilename, filename, { overwrite: true })
      } else {
        fs.removeSync(tmpFilename)
      }

      // Create the file node and return.
      createFileNode(filename, {}).then(fileNode => {
        // Override the default plugin as gatsby-source-filesystem needs to
        // be the owner of File nodes or there'll be conflicts if any other
        // File nodes are created through normal usages of
        // gatsby-source-filesystem.
        createNode(fileNode, { name: `gatsby-source-filesystem` })
        resolve(fileNode)
      })
    })
  }))
}
