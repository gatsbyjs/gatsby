"use strict"

const fs = require(`fs`)
const got = require(`got`)
const path = require(`path`)

const keywords = [`gatsby-plugin`, `gatsby-source`, `gatsby-transformer`]
const pluginsFile = path.join(__dirname, `plugins.json`)

const loadPlugins = async () => {
  try {
    return require(pluginsFile)
  } catch (err) {
    throw err
  }
}

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

const updatePlugins = (updates, plugins) => {
  let res = plugins.map(p => Object.assign({}, p))
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

const main = () => {
  loadPlugins()
    .then(plugins =>
      searchNPM()
        .then(transformResults)
        .then(packages => filterNotBlacklisted(packages, plugins))
        .then(packages => filterNotNotified(packages, plugins))
        .then(packages =>
          packages.map(p => {
            // TODO: notify / comment on github
            console.info(`Notify package "${p.name}"`)
            // return update status
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
