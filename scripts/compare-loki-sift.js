// Runs 2 gatsby builds in the current working directory. The first
// uses loki for the nodes db (GATSBY_DB_NODES=loki), and the second
// is a normal redux build.
//
// After each build, the contents of .cache/redux-state.json is copied
// into a new directory `_states` as either loki.json or
// redux.json. These are then compared to find out if the query
// results are different, and if so the differing data paths are
// printed out and a non-zero exit code is used

const fs = require(`fs-extra`)
const path = require(`path`)
const { exec } = require(`child_process`)
const _ = require(`lodash`)

const stateCopiesDir = path.join(process.cwd(), `_states`)
const reduxStatePath = path.join(process.cwd(), `.cache`, `redux-state.json`)

fs.ensureDirSync(stateCopiesDir)

function compareResults() {
  const queryResultsDir = path.join(process.cwd(), `public`, `static`, `d`)

  const redux = JSON.parse(
    fs.readFileSync(path.join(stateCopiesDir, `redux.json`))
  ).jsonDataPaths
  const loki = JSON.parse(
    fs.readFileSync(path.join(stateCopiesDir, `loki.json`))
  ).jsonDataPaths

  const uniqueKeys = _.uniq(_.keys(redux).concat(_.keys(loki)))

  const diffs = new Map()

  uniqueKeys.forEach(key => {
    if (redux[key] !== loki[key]) {
      diffs.set(key, {
        loki: loki[key],
        redux: redux[key],
      })

      // copy query result from loki to `_states/queries-loki/${queryID}.json`
      fs.copyFileSync(
        path.join(queryResultsDir, `${loki[key]}.json`),
        path.join(stateCopiesDir, `queries-loki`, `${key}.json`)
      )

      // copy query result from loki to `_states/queries-redux/${queryID}.json`
      fs.copyFileSync(
        path.join(queryResultsDir, `${redux[key]}.json`),
        path.join(stateCopiesDir, `queries-redux`, `${key}.json`)
      )
    }
  })

  if (diffs.size > 0) {
    console.log(`loki and redux queries returned different results`)
    console.table(diffs)
    process.exitCode = 1
  }
}

function runRedux() {
  const cmd = `rm -rf .cache && ./node_modules/.bin/gatsby build`
  console.log(`
Build with redux nodes:
  > ${cmd}
`)
  const childProcess = exec(cmd, {
    encoding: `utf-8`,
  })
  childProcess.on(`exit`, () => {
    fs.copyFileSync(reduxStatePath, path.join(stateCopiesDir, `redux.json`))
    compareResults()
  })
  childProcess.stdout.pipe(process.stdout)
  childProcess.stderr.pipe(process.stderr)
}

function runLoki() {
  const cmd = `rm -rf .cache && GATSBY_DB_NODES=loki ./node_modules/.bin/gatsby build`
  console.log(`
Build with loki nodes:
  > ${cmd}
`)
  const childProcess = exec(cmd, {
    encoding: `utf-8`,
  })
  childProcess.stdout.pipe(process.stdout)
  childProcess.stderr.pipe(process.stderr)
  childProcess.on(`exit`, () => {
    fs.copyFileSync(reduxStatePath, path.join(stateCopiesDir, `loki.json`))
    runRedux()
  })
}

runLoki()
