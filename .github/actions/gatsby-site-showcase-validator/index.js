// Load in modules
const fetch = require("node-fetch")
const yaml = require("js-yaml")
const cheerio = require("cheerio")
const chalk = require("chalk")

async function fetchAsSiteValidator(url) {
  return fetch(url, {
    headers: {
      "User-Agent":
        "gatsby-site-showcase-validator/1.0 (+https://github.com/gatsbyjs/gatsby/tree/master/.github/actions/gatsby-site-showcase-validator)",
    },
  })
}

async function run() {
  // Grab down sites.yml
  const url =
    "https://raw.githubusercontent.com/gatsbyjs/gatsby/master/docs/sites.yml"

  let yamlStr

  try {
    yamlStr = await fetchAsSiteValidator(url).then(resp => resp.text())
  } catch (err) {
    console.log(`[Err]: ${err.message}`)
    process.exit(1)
  }

  // Parse YAML
  const parsedYaml = yaml.safeLoad(yamlStr, "utf8")

  let sitesVisited = 0
  let nonGatsbySiteCount = 0
  let inaccessibleRepoCount = 0
  let erroredOut = 0
  const totalSitesCount = parsedYaml.length

  // Loop over each site
  for (let site of parsedYaml) {
    const siteUrl = site.main_url
    const sourceUrl = site.source_url
    let siteHtml

    // Fetch site
    try {
      siteHtml = await fetchAsSiteValidator(siteUrl).then(resp => resp.text())
    } catch (err) {
      console.log(
        `${chalk.red(`[Err]`)}: ${site.title} (${siteUrl}) ran into an error: ${
          err.message
        }`
      )
      sitesVisited++
      erroredOut++
      continue // Skip the rest of the check for this particular site
    }

    // Pass html into a parser
    const $ = cheerio.load(siteHtml)

    // Most Gatsby sites have an id of "___gatsby"
    const gatsbyContainer = $("#___gatsby")

    // The site is not a gatsby site, print out some info
    if (!gatsbyContainer.length) {
      console.log(
        `${chalk.yellow(`[Notice]`)}: ${
          site.title
        } (${siteUrl}) is not a Gatsby site`
      )
      nonGatsbySiteCount++
    }

    // Check if provided repository is public
    if (sourceUrl) {
      const status = await fetchAsSiteValidator(sourceUrl).then(
        ({ status }) => status
      )

      if (status !== 200) {
        console.log(
          `${chalk.yellow(`[Notice]`)}: ${
            site.title
          } (${siteUrl}) provided a 'source_url', but it's repository is inaccessible (${sourceUrl})`
        )
        inaccessibleRepoCount++
      }
    }

    sitesVisited++
  }

  console.log(
    chalk.green(
      `We visited ${sitesVisited}/${totalSitesCount} sites. Out of them, ${nonGatsbySiteCount} sites were not a Gatsby site, ${inaccessibleRepoCount} provided inaccessible repositories, and ${erroredOut} errored out when visiting it.`
    )
  )

  // If there are any non Gatsby sites or their `source_url` is inaccessible, fail (non-zero exit code)
  const exitCode = nonGatsbySiteCount > 0 || inaccessibleRepoCount > 0 ? 1 : 0
  process.exit(exitCode)
}

run()
