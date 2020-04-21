// This file is used to run our nightly cron jobs to test gatsby
// against future versions of react.
// @see https://reactjs.org/blog/2019/10/22/react-release-channels.html
// It updates all of our packages react/react-dom to an experimental
// channel, for which the circle ci config then installs.
//
// This file intentionally does not use in node-packages because it is
// ran before we do an install.
const fs = require(`fs`)

const packages = fs.readdirSync(`./packages`)

function replace(deps, library) {
  if (deps && deps[library]) {
    deps[library] = process.env.REACT_CHANNEL || `next`
  }
}

packages.forEach(packageName => {
  const path = `${process.cwd()}/packages/${packageName}/package.json`
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
})
