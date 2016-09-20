const s = require(`observable`).signal

const pages = s()
pages(new Map())
const site = s()
site(new Map())
exports.siteDB = site
exports.pagesDB = pages
exports.programDB = s()
