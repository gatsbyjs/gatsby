// noop

const { getArticle, search, getMetaData, fetchNodesFromSearch } = require("./src/fetch")

getArticle('Andries Tunru', 'nl').then(res => console.log(res))

search({query: 'kaas', limit: 10, lang: 'nl'}).then(res => console.log(res))

getMetaData('frommage', 'en')

fetchNodesFromSearch({query: 'velo', lang: 'fr'})

console.log('done.')