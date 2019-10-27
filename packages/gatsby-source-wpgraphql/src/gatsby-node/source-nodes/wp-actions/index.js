const { wpActionCREATE } = require(`./create`)
const { wpActionDELETE } = require(`./delete`)
const { wpActionUPDATE } = require(`./update`)

const handleWpActions = async helpers => {
  let cachedNodeIds
  switch (helpers.wpAction.actionType) {
    case `DELETE`:
      cachedNodeIds = await wpActionDELETE(helpers)
      break
    case `UPDATE`:
      cachedNodeIds = await wpActionUPDATE(helpers)
      break
    case `CREATE`:
      cachedNodeIds = await wpActionCREATE(helpers)
  }

  return cachedNodeIds
}

module.exports = handleWpActions
