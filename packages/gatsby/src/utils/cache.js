const Promise = require(`bluebird`)
const fs = require(`fs-extra`)
const _ = require(`lodash`)

const objectToMap = obj => new Map(Object.entries(obj))

const mapToObject = map => {
  const obj = {}
  for (let [key, value] of map) {
    obj[key] = value
  }
  return obj
}

let db
let directory
let save

/**
 * Initialize cache store. Reuse existing store if available.
 */
exports.initCache = () => {
  fs.ensureDirSync(`${process.cwd()}/.cache/cache`)
  if (process.env.NODE_ENV === `test`) {
    directory = require(`os`).tmpdir()
  } else {
    directory = process.cwd() + `/.cache/cache`
  }

  let previousState
  try {
    previousState = JSON.parse(fs.readFileSync(`${directory}/db.json`))
  } catch (e) {
    // ignore
  }

  if (previousState) {
    db = objectToMap(previousState)
  } else {
    db = new Map()
  }
}

/**
 * Get value of key
 * @param key
 * @returns {Promise}
 */
exports.get = key =>
  new Promise((resolve, reject) => {
    resolve(db.get(key))
  })

/**
 * Create or update key with value
 * @param key
 * @param value
 * @returns {Promise} - Promise object which resolves to 'Ok' if successful.
 */
exports.set = (key, value) =>
  new Promise((resolve, reject) => {
    db.set(key, value)
    save()
    resolve(`Ok`)
  })

if (process.env.NODE_ENV !== `test`) {
  save = _.debounce(() => {
    fs.writeFile(`${directory}/db.json`, JSON.stringify(mapToObject(db)))
  }, 250)
} else {
  save = _.noop
}
