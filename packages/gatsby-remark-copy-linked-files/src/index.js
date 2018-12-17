const visit = require(`unist-util-visit`)
const isRelativeUrl = require(`is-relative-url`)
const fs = require(`fs`)
const fsExtra = require(`fs-extra`)
const path = require(`path`)
const _ = require(`lodash`)
const cheerio = require(`cheerio`)
const imageSize = require(`probe-image-size`)

const DEPLOY_DIR = `public`

const invalidDestinationDirMessage = dir =>
  `[gatsby-remark-copy-linked-files You have supplied an invalid destination directory. The destination directory must be a child but was: ${dir}`

// dir must be a child
const destinationDirIsValid = dir => !path.relative(`./`, dir).startsWith(`..`)

const validateDestinationDir = dir =>
  !dir || (dir && destinationDirIsValid(dir))

const newFileName = linkNode =>
  `${linkNode.name}-${linkNode.internal.contentDigest}.${linkNode.extension}`

const newPath = (linkNode, destinationDir) => {
  if (destinationDir) {
    return path.posix.join(
      process.cwd(),
      DEPLOY_DIR,
      destinationDir,
      newFileName(linkNode)
    )
  }
  return path.posix.join(process.cwd(), DEPLOY_DIR, newFileName(linkNode))
}

const newLinkURL = (linkNode, destinationDir, pathPrefix) => {
  const linkPaths = [
    `/`,
    pathPrefix,
    destinationDir,
    newFileName(linkNode),
  ].filter(function(lpath) {
    if (lpath) return true
    return false
  })

  return path.posix.join(...linkPaths)
}

function toArray(buf) {
  var arr = new Array(buf.length)

  for (var i = 0; i < buf.length; i++) {
    arr[i] = buf[i]
  }

  return arr
}

module.exports = (
  { files, markdownNode, markdownAST, pathPrefix, getNode },
  pluginOptions = {}
) => {
  const defaults = {
    ignoreFileExtensions: [`png`, `jpg`, `jpeg`, `bmp`, `tiff`],
  }
  const { destinationDir } = pluginOptions
  if (!validateDestinationDir(destinationDir))
    return Promise.reject(invalidDestinationDirMessage(destinationDir))

  const options = _.defaults(pluginOptions, defaults)

  const filesToCopy = new Map()
  // Copy linked files to the destination directory and modify the AST to point
  // to new location of the files.
  const visitor = link => {
    if (
      isRelativeUrl(link.url) &&
      getNode(markdownNode.parent).internal.type === `File`
    ) {
      const linkPath = path.posix.join(
        getNode(markdownNode.parent).dir,
        link.url
      )
      const linkNode = _.find(files, file => {
        if (file && file.absolutePath) {
          return file.absolutePath === linkPath
        }
        return null
      })
      if (linkNode && linkNode.absolutePath) {
        const newFilePath = newPath(linkNode, options.destinationDir)

        // Prevent uneeded copying
        if (linkPath === newFilePath) return

        const linkURL = newLinkURL(linkNode, options.destinationDir, pathPrefix)
        link.url = linkURL
        filesToCopy.set(linkPath, newFilePath)
      }
    }
  }

  // Takes a node and generates the needed images and then returns
  // the needed HTML replacement for the image
  const generateImagesAndUpdateNode = function(image, node) {
    const imagePath = path.posix.join(
      getNode(markdownNode.parent).dir,
      image.attr(`src`)
    )
    const imageNode = _.find(files, file => {
      if (file && file.absolutePath) {
        return file.absolutePath === imagePath
      }
      return null
    })
    if (!imageNode || !imageNode.absolutePath) {
      return
    }

    const initialImageSrc = image.attr(`src`)
    // The link object will be modified to the new location so we'll
    // use that data to update our ref
    const link = { url: image.attr(`src`) }
    visitor(link)
    node.value = node.value.replace(
      new RegExp(image.attr(`src`), `g`),
      link.url
    )

    let dimensions

    if (!image.attr(`width`) || !image.attr(`height`)) {
      dimensions = imageSize.sync(
        toArray(fs.readFileSync(imageNode.absolutePath))
      )
    }

    // Generate default alt tag
    const srcSplit = initialImageSrc.split(`/`)
    const fileName = srcSplit[srcSplit.length - 1]
    const fileNameNoExt = fileName.replace(/\.[^/.]+$/, ``)
    const defaultAlt = fileNameNoExt.replace(/[^A-Z0-9]/gi, ` `)

    image.attr(`alt`, image.attr(`alt`) ? image.attr(`alt`) : defaultAlt)
    image.attr(
      `width`,
      image.attr(`width`) ? image.attr(`width`) : dimensions.width
    )
    image.attr(
      `height`,
      image.attr(`height`) ? image.attr(`height`) : dimensions.height
    )
  }

  visit(markdownAST, `link`, link => {
    const ext = link.url.split(`.`).pop()
    if (options.ignoreFileExtensions.includes(ext)) {
      return
    }

    visitor(link)
  })

  visit(markdownAST, `definition`, definition => {
    const ext = definition.url.split(`.`).pop()
    if (options.ignoreFileExtensions.includes(ext)) {
      return
    }

    visitor(definition)
  })

  // This will only work for markdown img tags
  visit(markdownAST, `image`, image => {
    const ext = image.url.split(`.`).pop()
    if (options.ignoreFileExtensions.includes(ext)) {
      return
    }

    // since dir will be undefined on non-files
    if (
      markdownNode.parent &&
      getNode(markdownNode.parent).internal.type !== `File`
    ) {
      return
    }

    const imagePath = path.posix.join(
      getNode(markdownNode.parent).dir,
      image.url
    )
    const imageNode = _.find(files, file => {
      if (file && file.absolutePath) {
        return file.absolutePath === imagePath
      }
      return false
    })

    if (imageNode) {
      visitor(image)
    }
  })

  // For each HTML Node
  visit(markdownAST, `html`, node => {
    const $ = cheerio.load(node.value)

    function processUrl({ url }) {
      try {
        const ext = url.split(`.`).pop()
        if (!options.ignoreFileExtensions.includes(ext)) {
          // The link object will be modified to the new location so we'll
          // use that data to update our ref
          const link = { url }
          visitor(link)
          node.value = node.value.replace(new RegExp(url, `g`), link.url)
        }
      } catch (err) {
        // Ignore
      }
    }

    // extracts all elements that have the provided url attribute
    function extractUrlAttributeAndElement(selection, attribute) {
      return (
        selection
          // extract the elements that have the attribute
          .map(function() {
            const element = $(this)
            const url = $(this).attr(attribute)
            if (url && isRelativeUrl(url)) {
              return { url, element }
            }
            return undefined
          })
          // cheerio object -> array
          .toArray()
          // filter out empty or undefined values
          .filter(Boolean)
      )
    }

    // Handle Images
    extractUrlAttributeAndElement($(`img[src]`), `src`).forEach(
      ({ url, element }) => {
        try {
          const ext = url.split(`.`).pop()
          if (!options.ignoreFileExtensions.includes(ext)) {
            generateImagesAndUpdateNode(element, node)
          }
        } catch (err) {
          // Ignore
        }
      }
    )

    // Handle video tags.
    extractUrlAttributeAndElement(
      $(`video source[src], video[src]`),
      `src`
    ).forEach(processUrl)

    // Handle audio tags.
    extractUrlAttributeAndElement(
      $(`audio source[src], audio[src]`),
      `src`
    ).forEach(processUrl)

    // Handle a tags.
    extractUrlAttributeAndElement($(`a[href]`), `href`).forEach(processUrl)

    return
  })

  return Promise.all(
    Array.from(filesToCopy, async ([linkPath, newFilePath]) => {
      // Don't copy anything is the file already exists at the location.
      if (!fsExtra.existsSync(newFilePath)) {
        try {
          await fsExtra.ensureDir(path.dirname(newFilePath))
          await fsExtra.copy(linkPath, newFilePath)
        } catch (err) {
          console.error(`error copying file`, err)
        }
      }
    })
  )
}
