const fs = require(`fs`)
const path = require(`path`)
const { promisify } = require(`util`)

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const readPackageJson = async root => {
  const fullPath = path.join(root, `package.json`)
  const contents = await readFile(fullPath, `utf8`)
  const obj = JSON.parse(contents)
  return obj
}

const writePackageJson = async (root, obj) => {
  const fullPath = path.join(root, `package.json`)
  const contents = JSON.stringify(obj, null, 2)
  await writeFile(fullPath, contents)
}

const create = async ({ root }, { name, command }) => {
  const pkg = await readPackageJson(root)
  pkg.scripts = pkg.scripts || {}
  pkg.scripts[name] = command
  await writePackageJson(root, pkg)
}

const read = async ({ root }, { name }) => {
  const pkg = await readPackageJson(root)

  return {
    name,
    command: pkg.scripts && pkg.scripts[name],
  }
}

const destroy = async ({ root }, { name }) => {
  const pkg = await readPackageJson(root)
  pkg.scripts = pkg.scripts || {}
  delete pkg.scripts[name]
  await writePackageJson(root, pkg)
}

module.exports.plan = async context => {
  return {
    currentState: ``,
    newState: ``,
    describe: `do stuff`,
  }
}

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
module.exports.config = {
  serial: true,
}
