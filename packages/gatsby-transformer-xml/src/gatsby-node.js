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
    function getLegacyElementValue(cValue) {
      // If the value is an attribute, return the string outright
      if (typeof cValue === `string`) return cValue

      // Otherwise, figure out if the value has child elements, and recurse accordingly.
      const keys = Object.keys(cValue)
      const values = keys.map(key => cValue[key])
      if (values.length > 1) {
        const arrayValues = keys.map(key => {
          return { name: key, content: getLegacyElementValue(cValue[key]) }
        })
        return arrayValues
      } else {
        // single value
        return values.join()
      }
    }

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
      /* In legacy mode, we want each child to become its own node.
       * Each node has a name property (childKey), and an xmlChildren
       * property. The xmlChildren property is later mapped from the children
       * property.
       */
      if (!useElementNamesAsKeys) {
        /* If the childValue is an array, we need to create an object
         * for each item in the array.
         */
        if (Array.isArray(childValue)) {
          childValue.map(cValue => {
            transformedObject.root.children = [
              ...transformedObject.root.children,
              {
                name: childKey,
                children: getLegacyElementValue(cValue),
              },
            ]
          })
        } else {
          // If its not an array, we just map the childValue to the key.
          transformedObject.root.children = [
            ...transformedObject.root.children,
            {
              name: childKey,
              children: getLegacyElementValue(childValue),
            },
          ]
        }
        return
      }

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
          : createNodeId(`${node.id} [${i ? i : ``}] >>> XML`),
      parent: node.id,
      children: [],
      internal: {
        contentDigest: createContentDigest(item),
        type: _.upperFirst(_.camelCase(`${node.name} xml`)),
      },
    }
  }
  if (!useElementNamesAsKeys) {
    xmlnodeArray = children.map((obj, i) => {
      if (obj.children) {
        obj.xmlChildren = obj.children
        delete obj.children
      }
      return createNodeFromXml(obj, i)
    })
  } else {
    // iterates the children from the object (2nd level down the rabbit hole)
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
