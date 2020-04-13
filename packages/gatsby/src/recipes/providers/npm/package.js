const execa = require(`execa`)
const _ = require(`lodash`)
const Joi = require(`@hapi/joi`)
const path = require(`path`)
const fs = require(`fs-extra`)
const { getConfigStore } = require(`gatsby-core-utils`)

const packageMangerConfigKey = `cli.packageManager`
const PACKAGE_MANGER = getConfigStore().get(packageMangerConfigKey) || `yarn`

const resourceSchema = require(`../resource-schema`)

const getPackageNames = packages => packages.map(n => `${n.name}@${n.version}`)

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

// Generate install commands
const generateClientComands = ({ packageManager, depType, packageNames }) => {
  let commands = []
  if (packageManager === `yarn`) {
    commands.push(`add`)
    // Needed for Yarn Workspaces and is a no-opt elsewhere.
    commands.push(`-W`)
    if (depType === `devDependency`) {
      commands.push(`--dev`)
    }

    return commands.concat(packageNames)
  } else if (packageManager === `npm`) {
    commands.push(`install`)
    if (depType === `devDependency`) {
      commands.push(`--save-dev`)
    }
    return commands.concat(packageNames)
  }
}

exports.generateClientComands = generateClientComands

let installs = []
const executeInstalls = async root => {
  const types = _.groupBy(installs, c => c.resource.dependencyType)

  // Grab the key of the first install & delete off installs these packages
  // then run intall
  // when done, check again & call executeInstalls again.
  const depType = installs[0].resource.dependencyType
  const packagesToInstall = types[depType]
  installs = installs.filter(
    i => !_.some(packagesToInstall, p => i.resource.id === p.resource.id)
  )

  const pkgs = packagesToInstall.map(p => p.resource)
  const packageNames = getPackageNames(pkgs)

  const commands = generateClientComands({
    packageNames,
    depType,
    packageManager: PACKAGE_MANGER,
  })

  const { stderr, stdout } = await execa(`yarn`, commands, {
    cwd: root,
  })

  packagesToInstall.forEach(p => p.outsideResolve())

  // Run again if there's still more installs.
  if (installs.length > 0) {
    executeInstalls()
  }
}

const debouncedExecute = _.debounce(executeInstalls, 25)

// Collect installs run at the same time so we can batch them.
const createInstall = async ({ root }, resource) => {
  let outsideResolve
  const promise = new Promise(resolve => {
    outsideResolve = resolve
  })
  installs.push({
    outsideResolve,
    resource,
  })

  debouncedExecute(root)
  return promise
}

const create = async ({ root }, resource) => {
  const { err, value } = validate(resource)
  if (err) {
    return err
  }

  await createInstall({ root }, value)
  return read({ root }, value.name)

  return new Promise(resolve => {
    setTimeout(async () => {
      const resources = await read({ root }, { packages })
      resolve(resources)
    }, 1)
  })
}

const read = async ({ root }, id) => {
  let packageJSON
  try {
    // TODO is there a better way to grab this? Can the position of `node_modules`
    // change?
    packageJSON = JSON.parse(
      await fs.readFile(path.join(root, `node_modules`, id, `package.json`))
    )
  } catch (e) {
    return undefined
  }
  return {
    id: packageJSON.name,
    name: packageJSON.name,
    version: packageJSON.version,
    _message: `Installed NPM package ${packageJSON.name}@${packageJSON.version}`,
  }
}

const schema = {
  name: Joi.string().required(),
  version: Joi.string().default(`latest`, `Defaults to "latest"`),
  dependencyType: Joi.string().default(
    `dependency`,
    `defaults to regular dependency`
  ),
  ...resourceSchema,
}

const validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

exports.validate = validate

const destroy = async ({ root }, resource) => {
  const { stderr, stdout } = await execa(`yarn`, [`remove`, resource.name], {
    cwd: root,
  })
  return resource
}

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
module.exports.schema = schema
module.exports.config = {}

module.exports.plan = async (context, resource) => {
  const {
    err,
    value: { name, version },
  } = validate(resource)

  const currentState = await read(context, resource.name)

  return {
    currentState:
      currentState && `${currentState.name}@${currentState.version}`,
    newState: `${name}@${version}`,
    describe: `Install ${name}@${version}`,
  }
}
