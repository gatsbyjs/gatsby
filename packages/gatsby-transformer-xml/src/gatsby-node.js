const convert = require(`xml-js`)
const _ = require(`lodash`)

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId, createContentDigest },
  pluginOptions
) {
  if (![`application/xml`, `text/xml`].includes(node.internal.mediaType)) {
    return
  }

  // set the default options.
  const defaultOptions = {
    compact: true,
    declarationKey: `declaration`,
    instructionKey: `instruction`,
    attributesKey: `attributes`,
    textKey: `text`,
    cdataKey: `cdata`,
    doctypeKey: `doctype`,
    parentKey: `parent`,
  }

  const {
    useElementNamesAsKeys,
    nativeType,
    trim,
    ignoreDeclaration,
    ignoreInstruction,
    ignoreAttributes,
    ignoreComment,
    ignoreCdata,
    ignoreDoctype,
    ignoreText,
  } = pluginOptions

  // merge defaults with plugin options
  const options = Object.assign({}, defaultOptions, {
    nativeType: typeof nativeType !== `undefined` ? nativeType : false,
    trim: typeof trim !== `undefined` ? trim : false,
    ignoreDeclaration:
      typeof ignoreDeclaration !== `undefined` ? ignoreDeclaration : true,
    ignoreInstruction:
      typeof ignoreInstruction !== `undefined` ? ignoreInstruction : false,
    ignoreAttributes:
      typeof ignoreAttributes !== `undefined` ? ignoreAttributes : false,
    ignoreComment: typeof ignoreComment !== `undefined` ? ignoreComment : true,
    ignoreCdata: typeof ignoreCdata !== `undefined` ? ignoreCdata : false,
    ignoreDoctype: typeof ignoreDoctype !== `undefined` ? ignoreDoctype : false,
    ignoreText: typeof ignoreText !== `undefined` ? ignoreText : false,
  })

  const { createNode, createParentChildLink } = actions // We only care about XML content.
  const localXML = await loadNodeContent(node)
  //variable to contain final node array
  let xmlnodeArray = []

  // variable to contain the parsed xml result
  const result = convert.xml2js(localXML, options)
  // variable to contain the same object as original plugin
  const transformedObject = {
    root: {
      name: ``,
      attributes: {},
      children: [],
    },
  }

  function createNewOutputFormat(result) {
    // recursively extract children from XML
    function extractChildrenFromResult(parentElement) {
      Object.entries(parentElement).forEach(([childKey, childValue]) => {
        if (Array.isArray(childValue)) {
          transformedObject.root.children = [
            ...transformedObject.root.children,
            { name: childKey, children: childValue },
          ]
        } else {
          extractChildrenFromResult(childValue)
        }
      })
    }

    Object.entries(result).forEach(([childKey, childValue]) => {
      /* If useElementNameAsKeys are false, we fall back to legacy mode,
       * which results in the same format as you would expect with the old xml2js implementation. No changes here.
       */
      if (!useElementNamesAsKeys) {
        /* If the childValue is an array, we need to create an object
         * for each item in the array.
         */
        if (Array.isArray(childValue)) {
          childValue.map(cValue => {
            const { attributes, ...values } = cValue
            transformedObject.root.children = [
              ...transformedObject.root.children,
              {
                attributes: { ...attributes },
                ...values,
              },
            ]
          })
        } else {
          // If its not an array, we just map the childValue to the key.
          const { attributes, ...values } = childValue
          transformedObject.root.children = [
            ...transformedObject.root.children,
            {
              attributes: { ...attributes },
              ...values,
            },
          ]
        }
        return
      }

      /* From here, we use a new implementation, given
       * the user wants to use xml element names as keys instead.
       */

      if (Array.isArray(childValue)) {
        transformedObject.root.children = [
          ...transformedObject.root.children,
          {
            name: childKey,
            children: childValue,
          },
        ]
      } else if (typeof childValue === `object`) {
        transformedObject.root.children = [
          ...transformedObject.root.children,
          { name: childKey, ...childValue },
        ]
      } else {
        extractChildrenFromResult(childValue)
      }
    })
  }

  // iteration of key/value pairs at top level
  Object.entries(result).forEach(([key, value]) => {
    transformedObject.root.name = key
    transformedObject.root.attributes = result[key].attributes
      ? result[key].attributes
      : {}

    // iterate over each parent element, and recursively extract their children
    createNewOutputFormat(result[key])
  })

  // destructure the children from the object
  const { root: { children } = [] } = transformedObject

  function createNodeFromXml(item, i) {
    return {
      ...item,
      id:
        _.get(item, `attributes.id`) !== undefined
          ? item.attributes.id
          : createNodeId(`${JSON.stringify(item)}`),
      parent: node.id,
      children: item.hasOwnProperty(`children`) ? [item.children] : [],
      internal: {
        contentDigest: createContentDigest(item),
        type: _.upperFirst(_.camelCase(`${node.name} xml`)),
      },
    }
  }
  if (!useElementNamesAsKeys) {
    children.forEach(element => {
      xmlnodeArray = [...xmlnodeArray, createNodeFromXml(element)]
    })
  } else {
    // iterates the children from the object
    children.forEach(element => {
      if (
        element.hasOwnProperty(`children`) &&
        Array.isArray(element.children)
      ) {
        // traverse children, and create gql nodes from them
        element.children.forEach((child, i) => {
          xmlnodeArray = [...xmlnodeArray, createNodeFromXml(child, i)]
        })
      } else {
        xmlnodeArray = [...xmlnodeArray, createNodeFromXml(element)]
      }
    })
  }

  // creates the nodes
  xmlnodeArray.forEach(element => {
    createNode(element)
    createParentChildLink({ parent: node, child: element })
  })

  return
}

exports.onCreateNode = onCreateNode
