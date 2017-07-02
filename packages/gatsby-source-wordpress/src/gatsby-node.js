/**
 *  
 * Source code for gatsby-source-wordpress plugin.
 * 
*/

const axios = require(`axios`)
const crypto = require(`crypto`)
const _ = require(`lodash`)
const stringify = require(`json-stringify-safe`)
const colorized = require(`./output-color`)

/* The GraphQL Nodes prefix. */
const wpNS = `wordpress__`

/* If true, will output many console logs. */
let verbose

/* The complete site URL. */
let siteURL


// ======== Main Void ==========
exports.sourceNodes = async (
  { boundActionCreators, getNode, hasNodeChanged, store },
  { baseUrl, protocol, hostingWPCOM, useACF, auth, verboseOutput }
) => {
  const { createNode, setPluginStatus, touchNode } = boundActionCreators
  verbose = verboseOutput
  siteURL = `${protocol}://${baseUrl}`

  console.log()
  console.log(colorized.out(`=START PLUGIN=====================================`, colorized.color.Font.FgBlue))
  console.time(`=END PLUGIN=====================================`)
  console.log(``)
  console.log(colorized.out(`Site URL: ${siteURL}`, colorized.color.Font.FgBlue))
  console.log(colorized.out(`Site hosted on Wordpress.com: ${hostingWPCOM}`, colorized.color.Font.FgBlue))
  console.log(colorized.out(`Using ACF: ${useACF}`, colorized.color.Font.FgBlue))
  console.log(colorized.out(`Using Auth: ${auth.user} ${auth.pass}`, colorized.color.Font.FgBlue))
  console.log(colorized.out(`Verbose output: ${verboseOutput}`, colorized.color.Font.FgBlue))
  console.log(``)

  // Touch existing Wordpress nodes so Gatsby doesn`t garbage collect them.
  _.values(store.getState().nodes)
    .filter(n => n.internal.type.slice(0, 10) === wpNS)
    .forEach(n => touchNode(n.id))

  let contractURL
  let wpAPIRoutes

  if (hostingWPCOM) {
    contractURL = `https://public-api.wordpress.com/wp/v2/sites/${baseUrl}`
  } else {
    contractURL = `${siteURL}/wp-json`
  }

  if (verbose) console.log(colorized.out(`The contract URL is`, colorized.color.Font.FgBlue), contractURL)

  // Call the API endpoint to discover the routes.
  try {
    let options = {
      method: `get`,
      url: contractURL,
    }
    if (auth != undefined) {
      options.auth = {
        username: auth.user,
        password: auth.pass,
      }
    }
    wpAPIRoutes = await axios(options)
  } catch (e) {
    console.log(colorized.out(`The server response was "${e.response.status} ${e.response.statusText}"`, colorized.color.Font.FgRed))
    if (e.response.data.message != undefined) console.log(colorized.out(`Inner exception message : "${e.response.data.message}"`, colorized.color.Font.FgRed))
    if (e.response.status == 400 || e.response.status == 401 || e.response.status == 403) console.log(colorized.out(`Please provide gatsby-source-wordpress's auth options parameters in site's gatsby-config.js`, colorized.color.Font.FgRed))
  }

  if (wpAPIRoutes != undefined) {

    let apiEndpoints = []

    Object.keys(wpAPIRoutes.data.routes).map(key => {
      if (verbose) console.log(`Route discovered :`, key)
      let route = wpAPIRoutes.data.routes[key]
      // Excluding every endpoint which is not a GET with no param
      if (route._links) {
        // Extract the last part of the URL which will act a the part type
        const p = route._links.self.substring(route._links.self.lastIndexOf(`/`) + 1, route._links.self.length)

        // Excluding the "technical" API endpoints        
        const t = [`v2`, `v3`, `1.0`, `2.0`, `embed`, `proxy`, ``, baseUrl]
        if (!t.includes(p)) {

          if (verbose) console.log(colorized.out(`Valid route found. Will try to fetch.`, colorized.color.Font.FgGreen))

          // Extract the endpoint "manufacturer"
          const n = route.namespace.substring(0, route.namespace.lastIndexOf(`/`))
          let type
          if (n == `wp`) {
            type = `${wpNS}${p.replace(/-/g, `_`)}`
          }
          else {
            type = `${wpNS}${n.replace(/-/g, `_`)}_${p.replace(/-/g, `_`)}`
          }

          // if (verbose) console.log(colorized.out(`NameSpace : ${wpNS} - Manufacturer : ${n} - Endpoint : ${p} - Type : ${type}`, colorized.color.Font.FgGreen))

          if (verbose) console.log(`GraphQL node internal.type will be : `, type)

          let f

          // If needed, define a custom GraphQL Node building function here.
          switch (type) {
            // Wordpress Native
            case `${wpNS}posts`:
              f = processPostsEntities
              break
            case `${wpNS}pages`:
              f = processPagesEntities
              break
            case `${wpNS}tags`:
              f = processTagsEntities
              break
            case `${wpNS}categories`:
              f = processCategoriesEntities
              break

            // Any other Wordpress native or plugin manugacturer namespace (ACF, WP-API-MENUS, etc.)
            default:
              f = processDefaultEntities
              break
          }
          apiEndpoints.push({
            'url': route._links.self,
            'type': type,
            'entityFunc': f,
          })

        } else {
          if (verbose) console.log(colorized.out(`Invalid route.`, colorized.color.Font.FgRed))
        }
      } else {
        if (verbose) console.log(colorized.out(`Invalid route.`, colorized.color.Font.FgRed))
      }
    })

    if (useACF) {
      // The OPTIONS ACF API Endpoint is not giving a valid _link so let`s add it manually.      
      apiEndpoints.push({
        'url': `${contractURL}/acf/v2/options`, // TODO : Need to test that out with ACF on Wordpress.com hosted site. Need a premium account on wp.com to install extensions.
        'type': `${wpNS}acf_options`,
        'entityFunc': processACFSiteOptionsEntity,
      })
      if (verbose) console.log(colorized.out(`Added ACF Options route.`, colorized.color.Font.FgGreen))
    }

    console.log(`Fetching the JSON data from ${apiEndpoints.length} valid API Endpoints...`)
    console.time(`Fetching data`)
    for (let e of apiEndpoints) {
      await fetchData(e, auth, createNode)
      console.log(``)
    }
    console.timeEnd(`Fetching data`)

    setPluginStatus({
      status: {
        lastFetched: new Date().toJSON(),
      },
    })

    console.timeEnd(`=END PLUGIN=====================================`)

  } else {
    console.log(colorized.out(`No routes to fetch. Ending.`, colorized.color.Font.FgRed))
  }
  return
}

/**
 * Fetch the data fril specifiend endpoint url, using the auth provided.
 * 
 * @param {any} endpoint 
 * @param {any} auth 
 * @param {any} createNode 
 */
const fetchData = async (endpoint, auth, createNode) => {

  const type = endpoint.type
  const url = endpoint.url
  const processEntityFunc = endpoint.entityFunc

  /// Fetch --------------------------------------------------------------------------------------------------------------
  console.log(colorized.out(`=== [ Fetching ${type} ] ===`, colorized.color.Font.FgBlue), url)

  if (verbose) console.time(`Fetching the ${type} took`)
  let result
  try {

    let options = {
      method: `get`,
      url: url,
    }

    if (auth != undefined) {
      options.auth = {
        username: auth.user,
        password: auth.pass,
      }
    }

    result = await axios(options)

  } catch (e) {
    // TODO : Better handling of dead source REST API (Retries, etc.)
    console.log(colorized.out(`The server response was "${e.response.status} ${e.response.statusText}"`, colorized.color.Font.FgRed))
    if (e.response.data.message != undefined) console.log(colorized.out(`Inner exception message : "${e.response.data.message}"`, colorized.color.Font.FgRed))
    if (e.response.status == 400 || e.response.status == 401 || e.response.status == 403) console.log(colorized.out(`Auth on endpoint is not implemented on this gatsby-source plugin.`, colorized.color.Font.FgRed))
  }

  // console.log(`result is`, result)

  if (verbose) console.timeEnd(`Fetching the ${type} took`)

  if (result && result.status.toString().startsWith(`2`)) {
    let length
    if (result != undefined && result.data != undefined && Array.isArray(result.data)) {
      length = result.data.length
    } else if (result.data != undefined && !Array.isArray(result.data)) {
      length = Object.keys(result.data).length
    }

    console.log(colorized.out(`${type} fetched : ${length}`, colorized.color.Font.FgGreen))

    if (verbose) console.time(`Parsing result ${type} took`)

    const nodes = processEntityFunc({ type: type, data: result.data })

    // console.log(`Nodes are :`, nodes)

    if (nodes.length) {
      nodes.forEach((node) => {
        createGraphQLNode(node, createNode)
      })
    }
    else {
      createGraphQLNode(nodes, createNode)
    }
    if (verbose) console.timeEnd(`Parsing result ${type} took`)
  }
}

const digest = str => crypto.createHash(`md5`).update(str).digest(`hex`)

/**
 * Create the Graph QL Node
 * 
 * @param {any} node 
 * @param {any} createNode 
 */
const createGraphQLNode = (node, createNode) => {
  if (node.id != undefined) {
    const gatsbyNode = {
      ...node,
      children: [],
      parent: `__SOURCE__`,
      internal: {
        ...node.internal,
        content: JSON.stringify(node),
        mediaType: `text/html`,
      },
      // TODO
      // author___NODE: result.data.data[i].relationships.uid.data.id,
    }
    gatsbyNode.internal.contentDigest = digest(stringify(gatsbyNode))
    createNode(gatsbyNode)
  }

}

const processCategoriesEntities = ({ type, data }) => {
  let toReturn = []
  data.map((ent, i) => {
    const newEnt = {
      id: `CATEGORY_${ent.id.toString().toUpperCase()}`,
      internal: {
        type: `${wpNS}CATEGORY`,
      },
      order: i + 1,
    }
    if (newEnt.revision_timestamp) {
      newEnt.revision_timestamp = new Date(
        newEnt.revision_timestamp
      ).toJSON()
    }
    toReturn.push(loopOtherFields(ent, newEnt, false, false))
  })
  return toReturn
}

const processTagsEntities = ({ type, data }) => {
  let toReturn = []
  data.map((ent, i) => {
    const newEnt = {
      id: `TAG_${ent.id.toString().toUpperCase()}`,
      internal: {
        type: `${wpNS}TAG`,
      },
      order: i + 1,
    }
    if (newEnt.revision_timestamp) {
      newEnt.revision_timestamp = new Date(
        newEnt.revision_timestamp
      ).toJSON()
    }
    toReturn.push(loopOtherFields(ent, newEnt, false, false))
  })
  return toReturn
}

const processPagesEntities = ({ type, data }) => {
  let toReturn = []
  data.map((ent, i) => {
    const newEnt = {
      id: `PAGE_${ent.id.toString().toUpperCase()}`,
      internal: {
        type: `${wpNS}PAGE`,
      },
      order: i + 1,
      created: new Date(ent.date).toJSON(),
      changed: new Date(ent.modified).toJSON(),
      title: ent.title.rendered,
      content: ent.content.rendered,
      excerpt: ent.excerpt.rendered,
    }
    if (newEnt.revision_timestamp) {
      newEnt.revision_timestamp = new Date(
        newEnt.revision_timestamp
      ).toJSON()
    }
    toReturn.push(loopOtherFields(ent, newEnt, true, true))
  })
  return toReturn
}

const processPostsEntities = ({ type, data }) => {
  let toReturn = []
  data.map((ent, i) => {
    const newEnt = {
      id: `POST_${ent.id.toString().toUpperCase()}`,
      internal: {
        type: `${wpNS}POST`,
      },
      order: i + 1,
      created: new Date(ent.date).toJSON(),
      changed: new Date(ent.modified).toJSON(),
      title: ent.title.rendered,
      content: ent.content.rendered,
      excerpt: ent.excerpt.rendered,
    }
    if (newEnt.revision_timestamp) {
      newEnt.revision_timestamp = new Date(
        newEnt.revision_timestamp
      ).toJSON()
    }
    toReturn.push(loopOtherFields(ent, newEnt, true, true))
  })
  return toReturn
}

/**
 * Process a default array of entities
 * 
 * @param {any} { type, data } 
 * @returns 
 */
const processDefaultEntities = ({ type, data }) => {
  try {
    let toReturn = []
    data.map((ent, i) => {

      let id = ent.id == undefined ? (ent.ID == undefined ? 0 : ent.ID) : ent.id

      const newEnt = {
        id: `${type}_${id.toString()}`,
        internal: {
          type: type.toUpperCase(),
        },
        order: i + 1,
      }
      if (newEnt.revision_timestamp) {
        newEnt.revision_timestamp = new Date(
          newEnt.revision_timestamp
        ).toJSON()
      }
      toReturn.push(loopOtherFields(ent, newEnt, false, false))
    })

    // console.log(colorized.out(`${type} has been processed using the default entity list processor`, colorized.color.Font.FgYellow))

    return toReturn
  } catch (e) {
    // If map() fails, then switch to a single entity type
    let toReturn = []
    let id = data.id == undefined ? (data.ID == undefined ? 0 : data.ID) : data.id
    const newEnt = {
      id: `${type}_${id.toString()}`,
      internal: {
        type: type.toUpperCase(),
      },
      order: 1,
    }
    if (newEnt.revision_timestamp) {
      newEnt.revision_timestamp = new Date(
        newEnt.revision_timestamp
      ).toJSON()
    }
    toReturn.push(loopOtherFields(data, newEnt, false, false))
    // console.log(colorized.out(`${type} has been processed using the default single entity processor`, colorized.color.Font.FgYellow))
    return toReturn
  }
}

/**
 * Process a single entity
 * 
 * @param {any} { type, data } 
 * @returns 
 */
const processACFSiteOptionsEntity = ({ type, data }) => {
  const newEnt = {
    id: type.toString().toUpperCase(), // Todo : Allow one or a collection of nodes. Yet : only one node.
    internal: {
      type: type,
    },
  }
  return loopOtherFields(data, newEnt, true, false)
}

/**
 * Will loop to add any other field of the JSON API to the Node object.
 * 
 * If includeACFField == true, will also add the ACF Fields as a JSON string if present, 
 * or add an empty ACF field.
 * 
 * If stringifyACFContents == true, the ACF Fields will be stringifyd. 
 * 
 * You'll then have to call `JSON.parse(acf)` in your site's code in order to get the content.
 * In most cases, this makes using ACF easier because GrahQL queries can then be written 
 * without knowing the data structure of ACF.
 * 
 * @param {any} ent
 * @param {any} newEnt 
 * @param {any} includeACFField 
 * @param {any} stringifyACFContents 
 * @returns 
 */
function loopOtherFields(ent, newEnt, includeACFField, stringifyACFContents) {
  newEnt = validateObjectTree(ent, newEnt, includeACFField, stringifyACFContents)
  // Because some solution will rely on the use of ACF fields and implement a component check on values of this field,
  // we want to ensure that the ACF field is always here even if ACF isn`t installed on Wordpress back-end.
  if (includeACFField && newEnt.acf == undefined) {
    newEnt.acf = []
  }
  return newEnt
}

/**
 * validate Object Tree
 * 
 * @param {any} ent 
 * @param {any} newEnt 
 * @param {any} includeACFField 
 * @param {any} stringifyACFContents 
 * @returns 
 */
function validateObjectTree(ent, newEnt, includeACFField, stringifyACFContents) {
  Object.keys(ent).map((k) => {
    if (!newEnt.hasOwnProperty(k)) {
      const val = ent[k]
      let key = k
      const NAME_RX = /^[_a-zA-Z][_a-zA-Z0-9]*$/
      if (!NAME_RX.test(key)) {
        const nkey = `_${key}`.replace(/-/g, `_`).replace(/:/g, `_`)
        if (verbose) console.log(colorized.out(`Object with key "${key}" that does not complies to GraphQL naming convention (will fail).`, colorized.color.Font.FgRed))
        if (verbose) console.log(colorized.out(`Renaming the key to "${nkey}"`, colorized.color.Font.FgRed))
        key = nkey
      }
      newEnt[key] = val

      if (includeACFField && stringifyACFContents && key == `acf` && val != `false`) {
        //Stringifying acf keys
        newEnt.acf = JSON.stringify(newEnt.acf)
        // TODO : Creating a node of mediaType application/json + link the parent node to this
      }

      // Nested objects
      if (typeof newEnt[key] == `object` && !Array.isArray(newEnt[key]) && newEnt[key] !== null && key !== `acf`) {
        // if (verbose) console.log(colorized.out(`Calling a recursive process on key [${typeof newEnt[key]}] ${key}`, colorized.color.Font.FgYellow))
        newEnt[key] = validateObjectTree(newEnt[key], {}, includeACFField, stringifyACFContents)

      } else if (typeof newEnt[key] == `object` && Array.isArray(newEnt[key]) && newEnt[key] !== null && key !== `acf`) {

        if (Array.isArray(newEnt[key]) && newEnt[key].length > 0 && typeof newEnt[key][0] == `object`) {
          // Array of objects
          // if (verbose) console.log(colorized.out(`Calling a recursive process on key [Array] ${key}`, colorized.color.Font.FgYellow))
          val.map((el, i) => {
            newEnt[key][i] = validateObjectTree(el, {}, includeACFField, stringifyACFContents)
          })
        }
      }
    }
  })
  return newEnt
}







// const mkdirp = require(`mkdirp`)
    // const cacheSitePath = `${store.getState().program.directory}/.cache/source-wordpress`
    // mkdirp(cacheSitePath, function (err) {
    //   if (err) console.error(err)
    // })
    // "get-urls": "^7.x",
// const getUrls = require(`get-urls`)
// const downloader = require(`./image-downloader.js`)
// const getImagesAndGraphQLNode = (node, auth, createNode, cacheSitePath) => {

//   const nodeStr = JSON.stringify(node)
//   // -------- Fetch the assets (images for now)
//   const urls = getUrls(nodeStr)

//   urls.forEach((url) => {
//     if (url.endsWith(`jpg`) || url.endsWith(`jpeg`) || url.endsWith(`png`) || url.endsWith(`gif`)) {
//       downloader.image({
//         url: url,
//         dest: cacheSitePath,
//         auth: auth,
//       })
//         .then(({ filename, image }) => {
//           // console.log(`Image saved to`, filename)
//         }).catch((err) => {
//           console.log(`Some error occurred. The image couldn\`t be downloaded.`, err)
//         })
//     }

//   })


// }


  // if (type !== `SiteSetting`) {
  //   // Re-fetching strategy init
  //   let lastFetched
  //   if (store.getState().status.plugins && store.getState().status.plugins[`gatsby-source-wordpress-acf`]) {
  //     lastFetched = store.getState().status.plugins[`gatsby-source-wordpress-acf`].lastFetched

  //     // TODO : Check why last fetched date is always undefined.
  //     // Date format of pages and posts is "2017-06-16T22:30:22"

  //   }

  //   if (lastFetched) {
  //     console.log(`The ${type}s source has been fetched previously.`, lastFetched)
  //     console.log(`Optimized the URL so the previously-fetched data isn`t loaded twice`)
  //     fetchURL = url

  //     // TODO : build the query that will only get the content added or updated from previous fetch. 

  //     // url = `${baseUrl}/jsonapi/node/article?filter[new-content][path]=changed&filter[new-content][value]=${parseInt(
  //     //   new Date(lastFetched).getTime() / 1000
  //     // ).toFixed(
  //     //   0
  //     // )}&filter[new-content][operator]=%3E&page[offset]=0&page[limit]=10`

  //   } else {
  //     fetchURL = url
  //   }

  // } else {

  //   fetchURL = url

  // }