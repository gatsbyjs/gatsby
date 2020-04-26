const { backend } = require(`../../nodes`)

module.exports = () => {
  if (backend === `loki`) {
    const lokiDb = require(`../../loki`)
    beforeAll(lokiDb.start)
  }
}
