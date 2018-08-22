const _ = require(`lodash`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const { fluid } = require(`gatsby-plugin-sharp`)
const fromParse5 = require(`hast-util-from-parse5`)
const astToHtml = require(`hast-util-to-html`)
const { selectAll } = require(`hast-util-select`)
const Parse5 = require(`parse5/lib/parser`)

const parser = new Parse5()

function toHast(html) {
  let p5 = parser.parseFragment(html)
  return fromParse5(p5)
}

function gatsbyifyImage(element, localFile, pluginOptions) {
  const defaults = {
    maxWidth: 650,
    wrapperStyle: ``,
    backgroundColor: `white`,
    linkImagesToOriginal: true,
    showCaptions: false, // const options = _.defaults(pluginOptions, defaults)
  }
  const options = _.defaults(pluginOptions, defaults)
  // HTML adapted from: https://github.com/gatsbyjs/gatsby/blob/27cd2a312956298cca555424129697a027a0429c/packages/gatsby-remark-images/src/index.js#L172
  const rawHTML = `
    <div
      class="gatsby-image-outer-wrapper"
      style="position: relative; display: block; ${
        options.wrapperStyle
      }; max-width: 1000px; margin-left: auto; margin-right: auto;"
    >
      <div
        class="gatsby-image-wrapper"
        style="padding-bottom: 1rem; position: relative; bottom: 0; left: 0; background-image: url('${
          localFile.fluid.base64
        }'); background-size: cover; display: block;"
      >
        <div style="width: 100%; padding-bottom: ${100 /
          localFile.fluid.aspectRatio}%;"></div>
        <img
          class="gatsby-resp-image-image ${
            element.properties.className
              ? element.properties.className.join(` `)
              : null
          }"
          style="width: 100%; height: 100%; margin: 0; vertical-align: middle; position: absolute; top: 0; left: 0; box-shadow: inset 0px 0px 0px 400px ${
            options.backgroundColor
          };"
          alt="${element.properties.alt ? element.properties.alt : ``}"
          title="${localFile.title ? localFile.title : ``}"
          src="${localFile.fluid.src}"
          srcset="${localFile.fluid.srcSet}"
          sizes="${localFile.fluid.sizes}"
        />
      </div>
    </div>
    `
  const transformed = toHast(rawHTML)
  const childElement = transformed.children.find(
    child => child.type === `element`
  )
  element.type = `element`
  element.tagName = childElement.tagName
  element.properties = childElement.properties
  element.children = childElement.children
  return element
}

async function inlineImagesToGatsby(element, nodeOptions, pluginOptions) {
  const {
    node,
    actions,
    getNode,
    getNodes,
    store,
    cache,
    createNodeId,
  } = nodeOptions
  const { hastOptions, protocol, verboseOutput } = pluginOptions
  const { createNode } = actions
  const mediaNodes = getNodes().filter(
    n => n.internal.type === `wordpress__wp_media`
  )
  const mediaNode = mediaNodes.find(m =>
    m.source_url.includes(element.properties.src)
  )
  let fileNode
  try {
    fileNode = getNode(mediaNode.localFile___NODE)
  } catch (e) {
    try {
      // For handling relative URLs (ie. `//www.gatsbyjs.org/image.png`)
      const protocolInUrl = element.properties.src.startsWith(`http`)
      const fetchUrl = protocolInUrl
        ? element.properties.src
        : `${protocol}:${element.properties.src}`
      fileNode = await createRemoteFileNode({
        url: fetchUrl,
        store,
        cache,
        createNode,
        createNodeId,
      })
    } catch (e) {
      if (verboseOutput) {
        console.log(
          `Error creating node for: ${element.properties.src} -- Message: ${e}`
        )
      }
      return element
    }
  }
  if (fileNode) {
    const fluidImages = await fluid({ file: fileNode })
    fileNode.fluid = fluidImages
    // FIXME: Add support for custom options
    element = gatsbyifyImage(element, fileNode, {})
  } else {
    if (verboseOutput) {
      console.log(
        `Error processing: ${
          element.properties.src
        } -- Message: No file node found or created`
      )
    }
  }
  return element
}

/*
 * Available Node API methods: https://github.com/gatsbyjs/gatsby/issues/4120#issuecomment-366725788
 *
 * Example `hastOptions` configuration:
 * hastOptions: [
 *   {
 *     nodeTypes: ['wordpress__POST', 'wordpress__PAGE'],
 *     htmlField: 'content',
 *     selector: 'img',
 *     transformFunction: inlineImagesToGatsby,
 *   }
 * ]
 */
async function runHastTransformations(nodeOptions, pluginOptions) {
  const { node } = nodeOptions
  const { hastOptions } = pluginOptions
  for (const option of hastOptions) {
    if (option.nodeTypes.includes(node.internal.type)) {
      const hast = toHast(node[option.htmlField])
      const targetElements = selectAll(option.selector, hast)
      await Promise.all(
        targetElements.map(async element => option.transformFunction(element, nodeOptions, pluginOptions))
      )
      node[option.htmlField] = astToHtml(hast)
    }
  }
  return node
}

exports.toHast = toHast
exports.inlineImagesToGatsby = inlineImagesToGatsby
exports.runHastTransformations = runHastTransformations
