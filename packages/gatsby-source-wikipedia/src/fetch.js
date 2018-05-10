const Promise = require(`bluebird`)
var querystring = require(`querystring`)
var axios = require(`axios`)

var apiBase = `https://en.wikipedia.org/w/api.php?`
var viewBase = `https://en.m.wikipedia.org/wiki/`

const fetchNodesFromSearch = ({ query, limit = 15 }) =>
  search({ query, limit }).then(results =>
    Promise.map(results, async (result, queryIndex) => {
      const rendered = await getArticle(result.id)
      const metadata = await getMetaData(result.id)
      return {
        id: result.id,
        title: result.title,
        description: result.description,
        updatedAt: metadata.updated,
        queryIndex: queryIndex + 1,
        rendered,
      }
    })
  )

const getMetaData = name => axios(
    apiBase +
      querystring.stringify({
        action: `query`,
        titles: name,
        format: `json`,
        redirects: `resolve`,
        prop: `extracts|revisions`,
        explaintext: 1,
        exsentences: 1,
      })
  )
    .then(r => r.data)
    .then(data => {
      var page = data.query.pages[Object.keys(data.query.pages)[0]]

      if (`missing` in page) {
        return { err: `Not found` }
      }

      let updated = new Date().toJSON()
      if (page.revisions) {
        updated = page.revisions[0].timestamp
      } else {
        console.log({ page, revisions: page.revisions })
      }
      return {
        title: page.title,
        extract: page.extract,
        urlId: page.title.replace(/\s/g, `_`),
        updated,
      }
    })

const search = ({ query, limit }) => axios(
    apiBase +
      querystring.stringify({
        action: `opensearch`,
        search: query,
        format: `json`,
        redirects: `resolve`,
        limit,
      })
  )
    .then(r => r.data)
    .then(([term, pageTitles, descriptions, urls]) => pageTitles.map((title, i) => {
        return {
          title,
          description: descriptions[i],
          id: /en.wikipedia.org\/wiki\/(.+)$/.exec(urls[i])[1],
        }
      }))

const getArticle = name => axios(viewBase + name + `?action=render`).then(r =>
    r.data.replace(/\/\/en\.wikipedia\.org\/wiki\//g, `/wiki/`)
  )

module.exports = { fetchNodesFromSearch, getMetaData, getArticle, search }
