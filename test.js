const fs = require(`fs`)
const _ = require(`lodash`)
const url = require(`url`)

const splitPaths = require(`./hash-pages`)

// let urls = fs.readFileSync(`./bricolage-urls.txt`, `utf-8`)
// let urls = fs.readFileSync(`./org.txt`, `utf-8`)
let urls = fs.readFileSync(`./guide.txt`, `utf-8`)

urls = urls.split(`\n`)

// Force trailing slash and then remove duplicates
urls = urls.map(p => {
  if (p.slice(-1) !== `/`) {
    p += `/`
  }
  return p
})
urls = _.uniq(urls)
const paths = urls.map(p => url.parse(p).pathname)

splitPaths(paths)
