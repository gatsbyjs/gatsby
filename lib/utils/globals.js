import loki from 'lokijs'
import observable from 'observable'

const db = new loki('db')
const routes = db.addCollection('routes')

exports.db = db
exports.routesDB = routes
const site = observable.value()
site({})
exports.site = site
