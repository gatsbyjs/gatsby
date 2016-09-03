import loki from 'lokijs'

const db = new loki('db')
const routes = db.addCollection('routes')

exports.db = db
exports.routesDB = routes
