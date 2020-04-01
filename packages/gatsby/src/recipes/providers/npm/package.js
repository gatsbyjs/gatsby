const execa = require(`execa`)

const getPackageNames = cmds => cmds.map(n => n.name)

const create = async ({ root }, cmds) => {
  await execa(`yarn`, [`add`, `-W`, ...getPackageNames(cmds)], { cwd: root })
}

const read = async (_, { name }) => {
  const { stdout } = await execa(`yarn`, [`why`, name], { cwd: root })
  return stdout
}

const update = async (_, cmds) => {
  await execa(`yarn`, [`upgrade`, `-W`, ...getPackageNames(cmds)], {
    cwd: root,
  })
}

const destroy = async (_, cmds) => {
  await execa(`yarn`, [`remove`, `-W`, ...getPackageNames(cmds)], { cwd: root })
}

module.exports.create = create
module.exports.update = update
module.exports.read = read
module.exports.destroy = destroy
module.exports.config = {
  batch: true,
}
