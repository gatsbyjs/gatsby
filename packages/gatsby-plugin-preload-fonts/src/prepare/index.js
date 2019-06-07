const puppeteer = require(`puppeteer`)
const path = require(`path`)
const { request } = require(`graphql-request`)
const crypto = require(`crypto`)
const { URL } = require(`url`)

const { load, save } = require(`./cache`)

// TODO: implement better logging
const log = { info: console.log, debug: console.log }

const {
  DEBUG = false,
  HOST = `localhost`,
  PORT = 8000,
  GRAPHQL_PATH = `/___graphql`,
} = process.env

// TODO: implement progress bar

const endpoint = path => `http://${HOST}:${PORT}${path}`

async function main() {
  const cache = await load()

  const query = `
    query Routes {
      allSitePage {
        nodes {
          path
        }
      }
    }
  `

  let routes
  try {
    const { allSitePage } = await request(endpoint(GRAPHQL_PATH), query)
    routes = allSitePage.nodes.map(n => n.path)
  } catch (err) {
    console.log(`
  err: could not establish a connection with the dev server
       attempted connection to ${endpoint(GRAPHQL_PATH)}

       make sure you've run \`gatsby develop\` and set the
       following env variables (if necessary)

         - HOST          (default: localhost)
         - PORT          (default: 8000)
         - GRAPHQL_PATH  (default: /___graphql)

`)
    process.exit(1)
  }

  let hash = crypto.createHash(`md5`)
  routes.forEach(hash.update)
  if (cache.hash === hash.digest(`hex`)) {
    // TODO: routes have no changed from last run; prompt user to
    // just use existing file since it's unlikely much has changed
    return
  }

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.on(`requestfinished`, e => {
    if (DEBUG && !e._url.match(/socket\.io/)) {
      log.info(`[load]`, e._method, e._url)
    }
    if (
      e._method === `GET` &&
      path.parse(e._url).ext.match(/^\.(otf|ttf|woff2?)$/)
    ) {
      log.debug(`[match]`, e._url)

      const { pathname } = new URL(page.url())

      if (!Object.prototype.hasOwnProperty.call(cache, pathname)) {
        cache[pathname] = {}
      }
      cache[pathname][e._url] = true
    }
  })

  hash = crypto.createHash(`md5`)
  for (const route of routes) {
    // wait until there are no more than 2 network connections for 500ms
    // to allow for dynamically inserted <link> and <script> tags to load
    // (there will always be one active connection since the dev server
    // keeps a connection open for hot module reloading so we can't wait
    // for networkidle0)
    //
    // unfortunately, this increases the minimum load time per route to
    // ~500ms, which adds up quickly on large sites; there may be room
    // for optimization here
    if (DEBUG) log.info(`[visit]`, route)
    hash.update(route)
    await page.goto(endpoint(route), { waitUntil: `networkidle2` })
  }

  await browser.close()

  cache.hash = hash.digest(`hex`)
  await save(cache)

  console.log(cache)
}

main()
