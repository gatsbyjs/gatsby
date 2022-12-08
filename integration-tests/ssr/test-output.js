// To run the test script manually on a site (e.g. to test a plugin):
// - build the site first
// - start the develop server
// - run this script
async function run() {
  const { generateHtmlPath } = require(`gatsby-core-utils`)
  const { join } = require(`path`)
  const fs = require(`fs-extra`)
  const fetch = require(`node-fetch`)
  const { diff } = require(`jest-diff`)
  const prettier = require(`prettier`)
  const cheerio = require(`cheerio`)
  const stripAnsi = require(`strip-ansi`)
  const pagesUsingEngines = require(`./pages-using-engines`)

  const devSiteBasePath = `http://localhost:8000`

  const comparePath = async path => {
    const format = htmlStr => prettier.format(htmlStr, { parser: `html` })

    const filterHtml = htmlStr => {
      const $ = cheerio.load(htmlStr)
      // There are many script tag differences
      $(`script`).remove()
      // Only added in production
      $(`style[data-identity="gatsby-global-css"]`).remove()
      // Only added in development
      $(`link[data-identity='gatsby-dev-css']`).remove()
      // Only in prod
      $(`link[rel="preload"]`).remove()
      // Only in prod
      $(`meta[name="generator"]`).remove()
      // Only in dev
      $(`meta[name="note"]`).remove()

      // remove any comments
      $.root()
        .find("*")
        .contents()
        .filter(function () {
          return this.type === "comment"
        })
        .remove()

      return $.html()
    }

    const getProdHtmlPath = path => {
      let maybeUsingEngine = pagesUsingEngines[path]
      if (maybeUsingEngine) {
        return maybeUsingEngine
      }
      return generateHtmlPath(join(process.cwd(), `public`), path)
    }

    const builtHtml = format(
      filterHtml(fs.readFileSync(getProdHtmlPath(path), `utf-8`))
    )

    // Fetch once to trigger re-compilation.
    await fetch(`${devSiteBasePath}/${path}`, {
      headers: {
        "x-gatsby-wait-for-dev-ssr": `1`,
      },
    })

    // Then wait for six seconds to ensure it's ready to go.
    // Otherwise, tests are flaky depending on the speed of the testing machine.
    await new Promise(resolve => {
      setTimeout(() => resolve(), 6000)
    })

    let devStatus = 200
    const rawDevHtml = await fetch(`${devSiteBasePath}/${path}`, {
      headers: {
        "x-gatsby-wait-for-dev-ssr": `1`,
      },
    }).then(res => {
      devStatus = res.status
      return res.text()
    })

    if (devStatus !== 200) {
      return false
    }

    const devHtml = format(filterHtml(rawDevHtml))
    const diffResult = diff(devHtml, builtHtml, {
      contextLines: 3,
      expand: false,
    })
    if (
      stripAnsi(diffResult) === `Compared values have no visual difference.`
    ) {
      return true
    } else {
      console.log(`path "${path}" has differences between dev & prod`)
      console.log(diffResult)
      return false
    }
  }

  const response = await fetch(`${devSiteBasePath}/__graphql`, {
    method: `POST`,
    headers: { "Content-Type": `application/json` },
    body: JSON.stringify({
      query: `query MyQuery {
  allSitePage {
    nodes {
      path
    }
  }
}
`,
    }),
  }).then(res => res.json()) // expecting a json response

  const paths = response.data.allSitePage.nodes
    .map(n => n.path)
    .filter(p => p !== `/dev-404-page/`)

  console.log(
    `testing these paths for differences between dev & prod outputs`,
    paths
  )

  const results = []

  // Run comparisons serially, otherwise recompilation fetches
  // interfere with each other when run within Promise.all
  for (const path of paths) {
    const result = await comparePath(path)
    results.push(result)
  }

  // Test all true
  if (results.every(r => r)) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
