"use strict"

const fs = require(`fs`)
const got = require(`got`)
const path = require(`path`)
require(`dotenv`).config()

const keywords = [`gatsby-plugin`, `gatsby-source`, `gatsby-transformer`]
const pluginsFile = path.join(__dirname, `plugins.json`)

const loadPlugins = async () => require(pluginsFile)

const savePlugins = plugins =>
  new Promise((resolve, reject) => {
    let output = `[\n\t`
    output += plugins
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
      .map(p => JSON.stringify(p))
      .join(`,\n\t`)
    output += `\n]\n`
    fs.writeFile(pluginsFile, output, err => {
      if (err) reject(err)
      resolve()
    })
  })

const searchNPM = () => {
  const promises = keywords.map(keyword => {
    const url = `https://api.npms.io/v2/search?q=${keyword}+keywords:-gatsby-plugin+not:deprecated&size=250`
    return got(url).then(response => JSON.parse(response.body))
  })
  return Promise.all(promises)
}

const transformResults = results => {
  const merged = results.reduce((t, r) => t.concat(r.results), [])
  const deduped = merged.reduce((t, r) => {
    t[r.package.name] = t[r.package.name] || r.package
    return t
  }, {})
  return Object.keys(deduped).map(d => deduped[d])
}

const filterNotBlacklisted = (packages, plugins) => {
  const blacklisted = plugins.filter(p => p.blacklist).map(p => p.name)
  return packages.filter(pkg => blacklisted.indexOf(pkg.name) < 0)
}

const filterNotNotified = (packages, plugins) => {
  const notified = plugins.filter(p => p.notified).map(p => p.name)
  return packages.filter(pkg => notified.indexOf(pkg.name) < 0)
}

const removePackagesWithoutRepository = packages =>
  packages.filter(pkg => !!pkg.links.repository)

const removeBadNameFormats = packages => packages.filter(p => hasGoodName(p))

const hasGoodName = pkg => {
  const name = pkg.name
  const isScopedPackage = name.startsWith(`@`)
  if (!isScopedPackage) {
    return startsWithAllowedPrefix(name)
  }

  const nameWithoutScope = name.slice(0, name.indexOf(`/`))
  return startsWithAllowedPrefix(nameWithoutScope)
}

const startsWithAllowedPrefix = name =>
  keywords.some(keyword => name.startsWith(keyword))

const removePackagesWithoutReadme = packages =>
  packages.filter(pkg => hasReadMe(pkg))

const hasReadMe = pkg => {
  if (pkg.links.homepage || pkg.readme) return true
  if (pkg.links.repository) {
    return got(pkg.links.repository + `/blob/master/README.md`)
      .then(response => response.statusCode === 200)
      .catch(_ => false)
  } else return false
}

const updatePlugins = (updates, plugins) => {
  const res = plugins.map(p => Object.assign({}, p))
  updates.forEach(u => {
    const idx = res.findIndex(r => r.name === u.name)
    if (idx >= 0) {
      res[idx] = Object.assign({}, res[idx], u)
    } else {
      res.push(u)
    }
  })
  return updates
}

const filterArchived = plugins => {
  if (!process.env.GITHUB_API_TOKEN) {
    throw new Error(
      `Please use instructions in README.md to setup GITHUB_API_TOKEN`
    )
  }

  const promises = plugins.map(plugin => {
    const [username, packageName] = plugin.links.repository.split(`/`).slice(-2)
    const url = `https://api.github.com/repos/${username}/${packageName}`
    return got(url, {
      headers: {
        Authorization: `token ${process.env.GITHUB_API_TOKEN}`,
      },
    })
      .then(response => JSON.parse(response.body))
      .then(repo => {
        return { [packageName]: repo.archived }
      })
      .catch(_ => {
        return { [packageName]: false }
      })
  })

  return Promise.all(promises)
    .then(resultsArray =>
      resultsArray.reduce((obj, result) => Object.assign(obj, result))
    )
    .then(result => plugins.filter(plugin => !result[plugin.name]))
}

const main = () => {
  loadPlugins()
    .then(plugins =>
      searchNPM()
        .then(transformResults)
        .then(packages => filterNotBlacklisted(packages, plugins))
        .then(packages => filterNotNotified(packages, plugins))
        .then(packages => removePackagesWithoutRepository(packages))
        .then(packages => removeBadNameFormats(packages))
        .then(packages => removePackagesWithoutReadme(packages))
        .then(packages => filterArchived(packages))
        .then(packages =>
          packages.map(p => {
            // TODO: notify / comment on GitHub
            console.info(`Notify package "${p.name}"`)
            // return update status
            // will turn notified to true once notifications are created
            return { name: p.name, blacklist: false, notified: false }
          })
        )
        .then(updates => updatePlugins(updates, plugins))
        .then(savePlugins)
    )
    .catch(err => {
      console.error(err)
    })
}

main()
