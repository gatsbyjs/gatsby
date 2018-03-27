const querystring = require(`querystring`)
const axios = require(`axios`)
const _ = require(`lodash`)
const colorized = require(`./output-color`)
const httpExceptionHandler = require(`./http-exception-handler`)

/**
 * High-level function to coordinate fetching data from a WordPress
 * site.
 */
async function fetch({
  _verbose,
  _siteURL,
  _useACF,
  _hostingWPCOM,
  _auth,
  _perPage,
  baseUrl,
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
  }

  if (_verbose) console.log()
  if (_verbose)
    console.log(
      colorized.out(
        `=START PLUGIN=====================================`,
        colorized.color.Font.FgBlue
      )
    )
  if (_verbose) console.time(`=END PLUGIN=====================================`)
  if (_verbose) console.log(``)
  if (_verbose)
    console.log(
      colorized.out(`Site URL: ${_siteURL}`, colorized.color.Font.FgBlue)
    )
  if (_verbose)
    console.log(
      colorized.out(
        `Site hosted on Wordpress.com: ${_hostingWPCOM}`,
        colorized.color.Font.FgBlue
      )
    )
  if (_verbose)
    console.log(
      colorized.out(`Using ACF: ${_useACF}`, colorized.color.Font.FgBlue)
    )
  if (_verbose)
    console.log(
      colorized.out(
        `Using Auth: ${_auth.htaccess_user} ${_auth.htaccess_pass}`,
        colorized.color.Font.FgBlue
      )
    )
  if (_verbose)
    console.log(
      colorized.out(`Verbose output: ${_verbose}`, colorized.color.Font.FgBlue)
    )
  if (_verbose) console.log(``)
  if (_verbose)
    console.log(
      colorized.out(`Mama Route URL: ${url}`, colorized.color.Font.FgBlue)
    )
  if (_verbose) console.log(``)

  // Call the main API Route to discover the all the routes exposed on this API.
  let allRoutes
  try {
    let options = {
      method: `get`,
      url: url,
    }
    if (_auth) {
      options.auth = {
        username: _auth.htaccess_user,
        password: _auth.htaccess_pass,
      }
    }
    allRoutes = await axios(options)
  } catch (e) {
    httpExceptionHandler(e)
  }

  let entities = []

  if (allRoutes) {
    let validRoutes = getValidRoutes({
      allRoutes,
      url,
      baseUrl,
      _verbose,
      _useACF,
      _hostingWPCOM,
      typePrefix,
      refactoredEntityTypes,
    })

    if (_verbose) console.log(``)
    if (_verbose)
      console.log(
        colorized.out(
          `Fetching the JSON data from ${
            validRoutes.length
          } valid API Routes...`,
          colorized.color.Font.FgBlue
        )
      )
    if (_verbose) console.log(``)

    for (let route of validRoutes) {
      entities = entities.concat(
        await fetchData({
          route,
          _verbose,
          _perPage,
          _hostingWPCOM,
          _auth,
          _accessToken,
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
 * Fetch the data from specified route url, using the auth provided.
 *
 * @param {any} route
 * @param {any} createNode
 */
async function fetchData({
  route,
  _verbose,
  _perPage,
  _hostingWPCOM,
  _auth,
  _accessToken,
}) {
  const type = route.type
  const url = route.url

  if (_verbose)
    console.log(
      colorized.out(
        `=== [ Fetching ${type} ] ===`,
        colorized.color.Font.FgBlue
      ),
      url
    )
  if (_verbose) console.time(`Fetching the ${type} took`)

  let routeResponse = await getPages(
    { url, _perPage, _hostingWPCOM, _auth, _accessToken },
    1
  )

  let entities = []
  if (routeResponse) {
    // Process entities to creating GraphQL Nodes.
    if (Array.isArray(routeResponse)) {
      routeResponse = routeResponse.map(r => {
        return { ...r, __type: type }
      })
      entities = entities.concat(routeResponse)
    } else {
      routeResponse.__type = type
      entities.push(routeResponse)
    }
    // WordPress exposes the menu items in meta links.
    if (type == `wordpress__wp_api_menus_menus`) {
      for (let menu of routeResponse) {
        if (menu.meta && menu.meta.links && menu.meta.links.self) {
          entities = entities.concat(
            await fetchData({
              route: { url: menu.meta.links.self, type: `${type}_items` },
              _verbose,
              _perPage,
              _hostingWPCOM,
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
  { url, _perPage, _hostingWPCOM, _auth, _accessToken, _verbose },
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
      if (_hostingWPCOM) {
        o.headers = {
          Authorization: `Bearer ${_accessToken}`,
        }
      } else {
        o.auth = _auth
          ? { username: _auth.htaccess_user, password: _auth.htaccess_pass }
          : null
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
      console.log(`\nTotal entities :`, total)
      console.log(`Pages to be requested :`, totalPages)
    }

    // We got page 1, now we want pages 2 through totalPages
    const requests = _.range(2, totalPages + 1).map(getPage => {
      const options = getOptions(getPage)
      return axios(options)
    })

    return Promise.all(requests).then(pages => {
      const data = pages.map(page => page.data)
      data.forEach(list => {
        result = result.concat(list)
      })
      return result
    })
  } catch (e) {
    return httpExceptionHandler(e)
  }
}

/**
 * Extract valid routes and format its data.
 *
 * @param {any} allRoutes
 * @param {any} url
 * @param {any} baseUrl
 * @returns
 */
function getValidRoutes({
  allRoutes,
  url,
  baseUrl,
  _verbose,
  _useACF,
  _hostingWPCOM,
  typePrefix,
  refactoredEntityTypes,
}) {
  let validRoutes = []

  for (let key of Object.keys(allRoutes.data.routes)) {
    if (_verbose) console.log(`Route discovered :`, key)
    let route = allRoutes.data.routes[key]

    // A valid route exposes its _links (for now)
    if (route._links) {
      const entityType = getRawEntityType(route)

      // Excluding the "technical" API Routes
      const excludedTypes = [
        undefined,
        `v2`,
        `v3`,
        `1.0`,
        `2.0`,
        `embed`,
        `proxy`,
        ``,
        baseUrl,
      ]
      if (!excludedTypes.includes(entityType)) {
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
        validRoutes.push({ url: route._links.self, type: validType })
      } else {
        if (_verbose)
          console.log(
            colorized.out(`Invalid route.`, colorized.color.Font.FgRed)
          )
      }
    } else {
      if (_verbose)
        console.log(colorized.out(`Invalid route.`, colorized.color.Font.FgRed))
    }
  }

  if (_useACF) {
    // The OPTIONS ACF API Route is not giving a valid _link so let`s add it manually.
    validRoutes.push({
      url: `${url}/acf/v2/options`,
      type: `${typePrefix}acf_options`,
    })
    if (_verbose)
      console.log(
        colorized.out(`Added ACF Options route.`, colorized.color.Font.FgGreen)
      )
    if (_hostingWPCOM) {
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

  return validRoutes
}

/**
 * Extract the raw entity type from route
 *
 * @param {any} route
 */
const getRawEntityType = route =>
  route._links.self.substring(
    route._links.self.lastIndexOf(`/`) + 1,
    route._links.self.length
  )

/**
 * Extract the route manufacturer
 *
 * @param {any} route
 */
const getManufacturer = route =>
  route.namespace.substring(0, route.namespace.lastIndexOf(`/`))

module.exports = fetch
