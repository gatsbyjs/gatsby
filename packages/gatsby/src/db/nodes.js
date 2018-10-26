const backend = process.env.GATSBY_DB_NODES || `redux`
let nodesDb
switch (backend) {
  case `redux`:
    nodesDb = require(`../redux/nodes`)
    break
  case `loki`:
    nodesDb = require(`./loki/nodes`)
    break
  default:
    throw new Error(
      `Unsupported DB nodes backend (value of env var GATSBY_DB_NODES)`
    )
}

module.exports = nodesDb
