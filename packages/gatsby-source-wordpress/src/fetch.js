const querystring = require(`querystring`)
const axios = require(`axios`)
const _ = require(`lodash`)
const minimatch = require(`minimatch`)
const { URL } = require(`url`)
const colorized = require(`./output-color`)
const httpExceptionHandler = require(`./http-exception-handler`)
const requestInQueue = require(`./request-in-queue`)

/**
 * Check auth object to see if we should fetch JWT access token
 */
const shouldUseJwt = auth => auth && (auth.jwt_user || auth.jwt_pass)

/**
 * Check auth object to see if we should use HTTP Basic Auth
 */
const shouldUseHtaccess = auth =>
  auth && (auth.htaccess_user || auth.htaccess_pass)

/**
 * Format Auth settings for verbose output
 */
const formatAuthSettings = auth => {
  let authOutputLines = []
  if (shouldUseJwt(auth)) {
    authOutputLines.push(`  JWT Auth: ${auth.jwt_user}:${auth.jwt_pass}`)
  }

  if (shouldUseHtaccess(auth)) {
    authOutputLines.push(
      `  HTTP Basic Auth: ${auth.htaccess_user}:${auth.htaccess_pass}`
    )
  }

  return authOutputLines.join(`\n`)
}

/**
 * High-level function to coordinate fetching data from a WordPress
 * site.
 */
async function fetch({
  baseUrl,
  _verbose,
  _siteURL,
  _useACF,
  _acfOptionPageIds,
  _hostingWPCOM,
  _auth,
  _perPage,
  _concurrentRequests,
  _includedRoutes,
  _excludedRoutes,
  typePrefix,
  refactoredEntityTypes,
}) {
  // If the site is hosted on wordpress.com, the API Route differs.
  // Same entity types are exposed (excepted for medias and users which need auth)
  // but the data model contain slights variations.
  let url
  let _accessToken
  if (_hostingWPCOM) {
    url = `https://public-api.wordpress.com/wp/v2/sites/${baseUrl}`
    _accessToken = await getWPCOMAccessToken(_auth)
  } else {
    url = `${_siteURL}/wp-json`
    if (shouldUseJwt(_auth)) {
      _accessToken = await getJWToken(_auth, url)
    }
  }

  if (_verbose) {
    console.time(`=END PLUGIN=====================================`)

    const authOutput = formatAuthSettings(_auth)

    console.log(
      colorized.out(
        `
=START PLUGIN=====================================

Site URL: ${_siteURL}
Site hosted on Wordpress.com: ${_hostingWPCOM}
Using ACF: ${_useACF}
Auth: ${authOutput ? `\n${authOutput}` : `false`}
Verbose output: ${_verbose}

Mama Route URL: ${url}
`,
        colorized.color.Font.FgBlue
      )
    )
  }

  // Call the main API Route to discover the all the routes exposed on this API.
  let allRoutes
  try {
    let options = {
      method: `get`,
      url: url,
    }
    if (shouldUseHtaccess(_auth)) {
      options.auth = {
        username: _auth.htaccess_user,
        password: _auth.htaccess_pass,
      }
    }

    if (_accessToken) {
      options.headers = {
        Authorization: `Bearer ${_accessToken}`,
      }
    }

    allRoutes = await axios(options)
  } catch (e) {
    httpExceptionHandler(e)
  }

  let entities = [
    {
      __type: `wordpress__site_metadata`,
      name: allRoutes.data.name,
      description: allRoutes.data.description,
      url: allRoutes.data.url,
      home: allRoutes.data.home,
    },
  ]

  if (allRoutes) {
    let validRoutes = getValidRoutes({
      allRoutes,
      url,
      _verbose,
      _useACF,
      _hostingWPCOM,
      _acfOptionPageIds,
      _includedRoutes,
      _excludedRoutes,
      typePrefix,
      refactoredEntityTypes,
    })

    if (_verbose) {
      console.log(
        colorized.out(
          `
Fetching the JSON data from ${validRoutes.length} valid API Routes...
`,
          colorized.color.Font.FgBlue
        )
      )
    }

    for (let route of validRoutes) {
      entities = entities.concat(
        await fetchData({
          route,
          apiUrl: url,
          _verbose,
          _perPage,
          _auth,
          _accessToken,
          _concurrentRequests,
        })
      )
      if (_verbose) console.log(``)
    }

    if (_verbose)
      console.timeEnd(`=END PLUGIN=====================================`)
  } else {
    console.log(
      colorized.out(`No routes to fetch. Ending.`, colorized.color.Font.FgRed)
    )
  }

  return entities
}

/**
 * Gets wordpress.com access token so it can fetch private data like medias :/
 *
 * @returns
 */
async function getWPCOMAccessToken(_auth) {
  let result
  const oauthUrl = `https://public-api.wordpress.com/oauth2/token`
  try {
    let options = {
      url: oauthUrl,
      method: `post`,
      data: querystring.stringify({
        client_secret: _auth.wpcom_app_clientSecret,
        client_id: _auth.wpcom_app_clientId,
        username: _auth.wpcom_user,
        password: _auth.wpcom_pass,
        grant_type: `password`,
      }),
    }
    result = await axios(options)
    result = result.data.access_token
  } catch (e) {
    httpExceptionHandler(e)
  }

  return result
}

/**
 * Gets JSON Web Token so it can fetch private data
 *
 * @returns
 */
async function getJWToken(_auth, url) {
  let result
  let authUrl = `${url}${_auth.jwt_base_path || `/jwt-auth/v1/token`}`
  try {
    const options = {
      url: authUrl,
      method: `post`,
      data: {
        username: _auth.jwt_user,
        password: _auth.jwt_pass,
      },
    }
    result = await axios(options)
    result = result.data.token
  } catch (e) {
    httpExceptionHandler(e)
  }

  return result
}

/**
 * Fetch the data from specified route url, using the auth provided.
 *
 * @param {any} route
 * @param {any} createNode
 */
async function fetchData({
  route,
  apiUrl,
  _verbose,
  _perPage,
  _auth,
  _accessToken,
  _concurrentRequests,
}) {
  const { type, url, optionPageId } = route

  if (_verbose) {
    console.log(
      colorized.out(
        `=== [ Fetching ${type} ] ===`,
        colorized.color.Font.FgBlue
      ),
      url
    )

    console.time(`Fetching the ${type} took`)
  }

  let routeResponse = await getPages({
    url,
    _perPage,
    _auth,
    _accessToken,
    _verbose,
    _concurrentRequests,
  })

  let entities = []
  if (routeResponse) {
    // Process entities to creating GraphQL Nodes.
    if (Array.isArray(routeResponse)) {
      routeResponse = routeResponse.map(r => {
        return {
          ...r,
          ...(optionPageId ? { __acfOptionPageId: optionPageId } : {}),
          __type: type,
        }
      })
      entities = entities.concat(routeResponse)
    } else {
      routeResponse.__type = type
      if (optionPageId) {
        routeResponse.__acfOptionPageId = optionPageId
      }
      entities.push(routeResponse)
    }

    // WordPress exposes the menu items in meta links.
    if (type == `wordpress__wp_api_menus_menus`) {
      for (let menu of routeResponse) {
        if (menu.meta && menu.meta.links && menu.meta.links.self) {
          entities = entities.concat(
            await fetchData({
              route: {
                url: useApiUrl(apiUrl, menu.meta.links.self),
                type: `${type}_items`,
              },
              apiUrl,
              _verbose,
              _perPage,
              _auth,
              _accessToken,
            })
          )
        }
      }
    }
    // TODO : Get the number of created nodes using the nodes in state.
    let length
    if (routeResponse && Array.isArray(routeResponse)) {
      length = routeResponse.length
    } else if (routeResponse && !Array.isArray(routeResponse)) {
      length = Object.keys(routeResponse).length
    }
    console.log(
      colorized.out(
        ` -> ${type} fetched : ${length}`,
        colorized.color.Font.FgGreen
      )
    )
  }

  if (_verbose) {
    console.timeEnd(`Fetching the ${type} took`)
  }

  return entities
}

/**
 * Get the pages of data
 *
 * @param {any} url
 * @param {number} [page=1]
 * @returns
 */
async function getPages(
  { url, _perPage, _auth, _accessToken, _concurrentRequests, _verbose },
  page = 1
) {
  try {
    let result = []

    const getOptions = page => {
      let o = {
        method: `get`,
        url: `${url}?${querystring.stringify({
          per_page: _perPage,
          page: page,
        })}`,
      }

      if (_accessToken) {
        o.headers = {
          Authorization: `Bearer ${_accessToken}`,
        }
      }

      if (shouldUseHtaccess(_auth)) {
        o.auth = {
          username: _auth.htaccess_user,
          password: _auth.htaccess_pass,
        }
      }

      return o
    }

    // Initial request gets the first page of data
    // but also the total count of objects, used for
    // multiple concurrent requests (rather than waterfall)
    const options = getOptions(page)
    const { headers, data } = await axios(options)

    result = result.concat(data)

    // Some resources have no paging, e.g. `/types`
    const wpTotal = headers[`x-wp-total`]

    const total = parseInt(wpTotal)
    const totalPages = parseInt(headers[`x-wp-totalpages`])

    if (!wpTotal || totalPages <= 1) {
      return result
    }

    if (_verbose) {
      console.log(`
Total entities : ${total}
Pages to be requested : ${totalPages}`)
    }

    // We got page 1, now we want pages 2 through totalPages
    const pageOptions = _.range(2, totalPages + 1).map(getPage =>
      getOptions(getPage)
    )

    const pages = await requestInQueue(pageOptions, {
      concurrent: _concurrentRequests,
    })

    const pageData = pages.map(page => page.data)
    pageData.forEach(list => {
      result = result.concat(list)
    })

    return result
  } catch (e) {
    return httpExceptionHandler(e)
  }
}

/**
 * Check a route against the whitelist or blacklist
 * to determine validity.
 *
 * @param {any} routePath
 * @param {Array} routeList
 * @returns {boolean}
 */
function checkRouteList(routePath, routeList) {
  return routeList.some(route => minimatch(routePath, route))
}

/**
 * Extract valid routes and format its data.
 *
 * @param {any} allRoutes
 * @param {any} url
 * @returns
 */
function getValidRoutes({
  allRoutes,
  url,
  _verbose,
  _useACF,
  _acfOptionPageIds,
  _hostingWPCOM,
  _includedRoutes,
  _excludedRoutes,
  typePrefix,
  refactoredEntityTypes,
}) {
  let validRoutes = []

  if (_useACF) {
    let defaultAcfNamespace = `acf/v3`
    // Grab ACF Version from namespaces
    const acfNamespace = allRoutes.data.namespaces
      ? allRoutes.data.namespaces.find(namespace => namespace.includes(`acf`))
      : null
    const acfRestNamespace = acfNamespace ? acfNamespace : defaultAcfNamespace
    _includedRoutes.push(`/${acfRestNamespace}/**`)

    if (_verbose)
      console.log(
        colorized.out(
          `Detected ACF to REST namespace: ${acfRestNamespace}.`,
          colorized.color.Font.FgGreen
        )
      )
    // The OPTIONS ACF API Route is not giving a valid _link so let`s add it manually
    // and pass ACF option page ID
    // ACF to REST v3 requires options/options
    let optionsRoute = acfRestNamespace.includes(`3`)
      ? `options/options/`
      : `options/`
    validRoutes.push({
      url: `${url}/${acfRestNamespace}/${optionsRoute}`,
      type: `${typePrefix}acf_options`,
    })
    // ACF to REST V2 does not allow ACF Option Page ID specification
    if (_acfOptionPageIds.length > 0 && acfRestNamespace.includes(`3`)) {
      _acfOptionPageIds.forEach(function(acfOptionPageId) {
        validRoutes.push({
          url: `${url}/acf/v3/options/${acfOptionPageId}`,
          type: `${typePrefix}acf_options`,
          optionPageId: acfOptionPageId,
        })
      })
      if (_verbose)
        console.log(
          colorized.out(
            `Added ACF Options route(s).`,
            colorized.color.Font.FgGreen
          )
        )
    }
    if (_acfOptionPageIds.length > 0 && _hostingWPCOM) {
      // TODO : Need to test that out with ACF on Wordpress.com hosted site. Need a premium account on wp.com to install extensions.
      if (_verbose)
        console.log(
          colorized.out(
            `The ACF options pages is untested under wordpress.com hosting. Please let me know if it works.`,
            colorized.color.Effect.Blink
          )
        )
    }
  }

  for (let key of Object.keys(allRoutes.data.routes)) {
    if (_verbose) console.log(`Route discovered :`, key)
    let route = allRoutes.data.routes[key]

    // A valid route exposes its _links (for now)
    if (route._links) {
      const entityType = getRawEntityType(key)

      // Excluding the "technical" API Routes
      const excludedTypes = [
        `/v2/**`,
        `/v3/**`,
        `**/1.0`,
        `**/2.0`,
        `**/embed`,
        `**/proxy`,
        `/`,
        `/jwt-auth/**`,
      ]

      const routePath = getRoutePath(url, key)

      const whiteList = _includedRoutes
      const blackList = [...excludedTypes, ..._excludedRoutes]

      // Check whitelist first
      const inWhiteList = checkRouteList(routePath, whiteList)
      // Then blacklist
      const inBlackList = checkRouteList(routePath, blackList)
      const validRoute = inWhiteList && !inBlackList

      if (validRoute) {
        if (_verbose)
          console.log(
            colorized.out(
              `Valid route found. Will try to fetch.`,
              colorized.color.Font.FgGreen
            )
          )

        const manufacturer = getManufacturer(route)

        let rawType = ``
        if (manufacturer === `wp`) {
          rawType = `${typePrefix}${entityType}`
        }

        let validType
        switch (rawType) {
          case `${typePrefix}posts`:
            validType = refactoredEntityTypes.post
            break
          case `${typePrefix}pages`:
            validType = refactoredEntityTypes.page
            break
          case `${typePrefix}tags`:
            validType = refactoredEntityTypes.tag
            break
          case `${typePrefix}categories`:
            validType = refactoredEntityTypes.category
            break
          default:
            validType = `${typePrefix}${manufacturer.replace(
              /-/g,
              `_`
            )}_${entityType.replace(/-/g, `_`)}`
            break
        }

        validRoutes.push({
          url: buildFullUrl(url, key, _hostingWPCOM),
          type: validType,
        })
      } else {
        if (_verbose) {
          const invalidType = inBlackList ? `blacklisted` : `not whitelisted`
          console.log(
            colorized.out(
              `Excluded route: ${invalidType}`,
              colorized.color.Font.FgYellow
            )
          )
        }
      }
    } else {
      if (_verbose)
        console.log(
          colorized.out(
            `Invalid route: detail route`,
            colorized.color.Font.FgRed
          )
        )
    }
  }

  return validRoutes
}

/**
 * Extract the raw entity type from fullPath
 *
 * @param {any} full path to extract raw entity from
 */
const getRawEntityType = fullPath =>
  fullPath.substring(fullPath.lastIndexOf(`/`) + 1, fullPath.length)

/**
 * Extract the route path for an endpoint
 *
 * @param {any} baseUrl The base site URL that should be removed
 * @param {any} fullPath The full path to retrieve the route path from
 */
const getRoutePath = (baseUrl, fullPath) => {
  const baseUrlObj = new URL(baseUrl)
  const basePath = baseUrlObj.pathname
  return fullPath.replace(basePath, ``)
}

/**
 * Extract the route path for an endpoint
 *
 * @param {string} apiUrl base site API URL
 * @param {string} self URL that returned from server response. May contain domain differs from apiUrl
 * @returns {string} URL to endpoint using baseURL
 */
const useApiUrl = (apiUrl, endpointURL) => {
  // Replace route self host to baseUrl if differs
  const isDifferentDomains = endpointURL.indexOf(apiUrl) === -1
  if (isDifferentDomains) {
    return endpointURL.replace(/(.*?)\/wp-json/, apiUrl)
  }
  return endpointURL
}

/**
 * Build full URL from baseUrl and fullPath.
 * Method of contructing full URL depends on wether it's hosted on wordpress.com
 * or not as wordpress.com have slightly different (custom) REST structure
 *
 * @param {any} baseUrl The base site URL that should be prepended to full path
 * @param {any} fullPath The full path to build URL from
 * @param {boolean} _hostingWPCOM Is hosted on wordpress.com
 */
const buildFullUrl = (baseUrl, fullPath, _hostingWPCOM) => {
  if (_hostingWPCOM) {
    baseUrl = new URL(baseUrl).origin
  }
  return `${baseUrl}${fullPath}`
}

/**
 * Extract the route manufacturer
 *
 * @param {any} route
 */
const getManufacturer = route =>
  route.namespace.substring(0, route.namespace.lastIndexOf(`/`))

fetch.getRawEntityType = getRawEntityType
fetch.getRoutePath = getRoutePath
fetch.buildFullUrl = buildFullUrl
fetch.useApiUrl = useApiUrl
module.exports = fetch
