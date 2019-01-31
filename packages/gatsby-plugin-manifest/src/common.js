const fs = require(`fs`)
import crypto from "crypto"

// default icons for generating icons
exports.defaultIcons = [
  {
    src: `icons/icon-48x48.png`,
    sizes: `48x48`,
    type: `image/png`,
  },
  {
    src: `icons/icon-72x72.png`,
    sizes: `72x72`,
    type: `image/png`,
  },
  {
    src: `icons/icon-96x96.png`,
    sizes: `96x96`,
    type: `image/png`,
  },
  {
    src: `icons/icon-144x144.png`,
    sizes: `144x144`,
    type: `image/png`,
  },
  {
    src: `icons/icon-192x192.png`,
    sizes: `192x192`,
    type: `image/png`,
  },
  {
    src: `icons/icon-256x256.png`,
    sizes: `256x256`,
    type: `image/png`,
  },
  {
    src: `icons/icon-384x384.png`,
    sizes: `384x384`,
    type: `image/png`,
  },
  {
    src: `icons/icon-512x512.png`,
    sizes: `512x512`,
    type: `image/png`,
  },
]

/**
 * Check if the icon exists on the filesystem
 *
 * @param {String} srcIcon Path of the icon
 */
exports.doesIconExist = function doesIconExist(srcIcon) {
  try {
    return fs.statSync(srcIcon).isFile()
  } catch (e) {
    if (e.code === `ENOENT`) {
      return false
    } else {
      throw e
    }
  }
}

exports.createContentDigest = function createContentDigest(content) {
  let digest = crypto
    .createHash(`sha1`)
    .update(content)
    .digest(`hex`)

  return digest
}

/**
 * @param {Array} path The generic path to an icon
 * @param {String} digest The digest of the icon provided in the plugin's options.
 */
exports.addDigestToPath = function(path, digest, method) {
  let newPath = ``

  if (method === `name`) {
    newPath = `${path.substring(
      0,
      path.lastIndexOf(`.`)
    )}-${digest}${path.substring(path.lastIndexOf(`.`))}`
  } else if (method === `query`) {
    newPath = `${path}?digest=${digest}}`
  } else {
    newPath = path
  }

  return newPath
}
