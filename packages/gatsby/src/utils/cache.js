const Promise = require(`bluebird`)
const low = require(`lowdb`)
const fs = require(`fs-extra`)
const _ = require(`lodash`)

let db
let directory
exports.initCache = () => {
  fs.ensureDirSync(`${process.cwd()}/.cache/cache`)
  if (process.env.NODE_ENV === `test`) {
    directory = require(`os`).tmpdir()
  } else {
    directory = process.cwd() + `/.cache/cache`
  }
  db = low(null, {
    format: {
      serialize: obj => JSON.stringify(obj),
      deserialize: str => JSON.parse(str),
    },
  })
  db._.mixin(require(`lodash-id`))

  let previousState
  try {
    previousState = JSON.parse(fs.readFileSync(`${directory}/db.json`))
  } catch (e) {
    // ignore
  }

  if (previousState) {
    console.log("there is previous state")
    db.defaults(previousState).write()
  } else {
    db.defaults({ keys: [] }).write()
  }
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
    save()
    resolve(`Ok`)
  })

let save

if (process.env.NODE_ENV !== `test`) {
  console.log("writing out cache")
  save = _.debounce(() => {
    fs.writeFile(`${directory}/db.json`, JSON.stringify(db.getState()))
  }, 250)
} else {
  save = _.noop
}
