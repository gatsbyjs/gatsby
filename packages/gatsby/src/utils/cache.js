const levelup = require(`level`)
const Promise = require(`bluebird`)
const fs = require(`fs-extra`)

let db
exports.initCache = () => {
  fs.ensureDirSync(`${process.cwd()}/.cache/cache`)
  if (process.env.NODE_ENV === `test`) {
    db = {
      get: () => false,
      set: () => false,
    }
  } else {
    db = levelup(`${process.cwd()}/.cache/cache`, {
      keyEncoding: `json`,
      valueEncoding: `json`,
    })
  }
}

exports.get = key =>
  new Promise((resolve, reject) => {
    db.get(key, (err, value) => {
      if (err && !err.notFound) {
        reject(err)
      } else {
        resolve(value)
      }
    })
  })

exports.set = (key, value) =>
  new Promise((resolve, reject) => {
    db.put(key, value, err => {
      if (err) {
        reject(err)
      } else {
        resolve(`OK`)
      }
    })
  })
