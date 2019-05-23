const { bindActionCreators } = require(`redux`)
const { store } = require(`..`)

const { actions: internalActions } = require(`./internal`)
const { actions: publicActions } = require(`./public`)
const { actions: restrictedActions, availableInAPI } = require(`./restricted`)

exports.internalActions = internalActions
exports.publicActions = publicActions
exports.restrictedActions = restrictedActions
exports.restrictedActionsAvailableInAPI = availableInAPI

const actions = {
  ...internalActions,
  ...publicActions,
  ...restrictedActions,
}

exports.actions = actions

// Deprecated, remove in v3
exports.boundActionCreators = bindActionCreators(actions, store.dispatch)
