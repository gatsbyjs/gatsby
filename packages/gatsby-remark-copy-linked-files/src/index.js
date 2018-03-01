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

const newLinkURL = (linkNode, destinationDir) => {
  if (destinationDir) {
    return path.posix.join(`/`, destinationDir, newFileName(linkNode))
  }
  return path.posix.join(`/`, newFileName(linkNode))
}

function toArray(buf) {
  var arr = new Array(buf.length)

  for (var i = 0; i < buf.length; i++) {
    arr[i] = buf[i]
  }

  return arr
}

module.exports = (
  { files, markdownNode, markdownAST, getNode },
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

        const linkURL = newLinkURL(linkNode, options.destinationDir)
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

    // Handle Images
    const imageRefs = []
    $(`img`).each(function() {
      try {
        if (isRelativeUrl($(this).attr(`src`))) {
          imageRefs.push($(this))
        }
      } catch (err) {
        // Ignore
      }
    })

    for (let thisImg of imageRefs) {
      try {
        const ext = thisImg
          .attr(`src`)
          .split(`.`)
          .pop()
        if (options.ignoreFileExtensions.includes(ext)) {
          return
        }

        generateImagesAndUpdateNode(thisImg, node)
      } catch (err) {
        // Ignore
      }
    }

    // Handle video tags.
    const videoRefs = []
    $(`video source`).each(function() {
      try {
        if (isRelativeUrl($(this).attr(`src`))) {
          videoRefs.push($(this))
        }
      } catch (err) {
        // Ignore
      }
    })

    for (let thisVideo of videoRefs) {
      try {
        const ext = thisVideo
          .attr(`src`)
          .split(`.`)
          .pop()
        if (options.ignoreFileExtensions.includes(ext)) {
          return
        }

        // The link object will be modified to the new location so we'll
        // use that data to update our ref
        const link = { url: thisVideo.attr(`src`) }
        visitor(link)
        node.value = node.value.replace(
          new RegExp(thisVideo.attr(`src`), `g`),
          link.url
        )
      } catch (err) {
        // Ignore
      }
    }

    // Handle audio tags.
    const audioRefs = []
    $(`audio source`).each(function() {
      try {
        if (isRelativeUrl($(this).attr(`src`))) {
          audioRefs.push($(this))
        }
      } catch (err) {
        // Ignore
      }
    })

    for (let thisAudio of audioRefs) {
      try {
        const ext = thisAudio
          .attr(`src`)
          .split(`.`)
          .pop()
        if (options.ignoreFileExtensions.includes(ext)) {
          return
        }

        const link = { url: thisAudio.attr(`src`) }
        visitor(link)
        node.value = node.value.replace(
          new RegExp(thisAudio.attr(`src`), `g`),
          link.url
        )
      } catch (err) {
        // Ignore
      }
    }

    // Handle a tags.
    const aRefs = []
    $(`a`).each(function() {
      try {
        if (isRelativeUrl($(this).attr(`href`))) {
          aRefs.push($(this))
        }
      } catch (err) {
        // Ignore
      }
    })

    for (let thisATag of aRefs) {
      try {
        const ext = thisATag
          .attr(`href`)
          .split(`.`)
          .pop()
        if (options.ignoreFileExtensions.includes(ext)) {
          return
        }

        const link = { url: thisATag.attr(`href`) }
        visitor(link)

        node.value = node.value.replace(
          new RegExp(thisATag.attr(`href`), `g`),
          link.url
        )
      } catch (err) {
        // Ignore
      }
    }

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
