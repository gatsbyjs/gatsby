const Promise = require(`bluebird`)
const low = require(`lowdb`)
const fs = require(`fs-extra`)

let db
exports.initCache = () => {
  fs.ensureDirSync(`${process.cwd()}/.cache/cache`)
  let directory
  if (process.env.NODE_ENV === `test`) {
    directory = require(`os`).tmpdir()
  } else {
    directory = process.cwd() + `/.cache/cache`
  }
  db = low(`${directory}/site-cache.json`, {
    storage: require(`lowdb/lib/storages/file-async`),
    format: {
      serialize: obj => JSON.stringify(obj),
      deserialize: str => JSON.parse(str),
    },
  })
  db._.mixin(require(`lodash-id`))

  db.defaults({ keys: [] }).write()
}

exports.get = key =>
  new Promise((resolve, reject) => {
    let pair
    try {
      pair = db.get(`keys`).getById(key).value()
    } catch (e) {
      // ignore
    }

    if (pair) {
      resolve(pair.value)
    } else {
      resolve()
    }
  })

exports.set = (key, value) =>
  new Promise((resolve, reject) => {
    db.get(`keys`).upsert({ id: key, value }).write()
    resolve(`Ok`)
  })
