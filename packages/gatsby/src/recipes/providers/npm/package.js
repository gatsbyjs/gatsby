const execa = require(`execa`)
const _ = require(`lodash`)
const humanizeList = require(`humanize-list`)

const getPackageNames = packages => packages.map(n => n.name)
const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const create = async ({ root }, packages) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 1000)
  })
/*
  const types = _.groupBy(packages, c => c.dependencyType)

  // Run install for each dependency type
  await asyncForEach(Object.keys(types), async type => {
    let typeFlag = ``
    if (type === `dev`) {
      typeFlag = `--dev`
    }
    const command = [
      `yarn`,
      [`add`, `-W`, typeFlag, ...getPackageNames(types[type])],
      {
        cwd: root,
      },
    ]

    let commands
    if (typeFlag !== ``) {
      commands = [`add`, `-W`, typeFlag, ...getPackageNames(types[type])]
    } else {
      commands = [`add`, `-W`, ...getPackageNames(types[type])]
    }

    const { stdout } = await execa(`yarn`, commands, {
      cwd: root,
    })
    console.log(stdout)
  })
  */

const read = async (_, { name }) => {
  const { stdout } = await execa(`yarn`, [`why`, name], { cwd: root })
  return stdout
}

const update = async (_, packages) => {
  await execa(`yarn`, [`upgrade`, `-W`, ...getPackageNames(packages)], {
    cwd: root,
  })
}

const destroy = async (_, packages) => {
  await execa(`yarn`, [`remove`, `-W`, ...getPackageNames(packages)], {
    cwd: root,
  })
}

module.exports.create = create
module.exports.update = update
module.exports.read = read
module.exports.destroy = destroy
module.exports.config = {
  batch: true,
}

module.exports.plan = (_, packages) => {
  const packageNames = getPackageNames(packages)

  return {
    currentState: [],
    newState: [packageNames],
    describe: `Install ${humanizeList(packageNames)}`,
  }
}
