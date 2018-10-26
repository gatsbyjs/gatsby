const loki = process.env.GATSBY_USE_LOKI_DB
const nodesDb = loki ? require(`./loki/nodes`) : require(`../redux/nodes`)

module.exports = nodesDb
