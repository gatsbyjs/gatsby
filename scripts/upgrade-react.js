// This file is used in CircleCI to update the React versions of e2e/integration tests
// It receives two env vars:
// REACT_VERSION and TEST_PATH
//
// This file intentionally does not use in node-packages because it is
// ran before we do an install.
const fs = require(`fs`)

function replace(deps, library) {
  if (deps && deps[library]) {
    deps[library] = process.env.REACT_VERSION
  }
}

const path = `${process.cwd()}/${process.env.TEST_PATH}/package.json`

fs.readFile(path, (err, json) => {
  if (err) return
  const pkg = JSON.parse(json)

  replace(pkg.dependencies, `react`)
  replace(pkg.devDependencies, `react`)
  replace(pkg.dependencies, `react-dom`)
  replace(pkg.devDependencies, `react-dom`)

  console.log(`updating ${path}`)

  fs.writeFileSync(path, JSON.stringify(pkg, null, 2))
})
