"use strict";

exports.__esModule = true;
exports.activityTick = exports.setActivityTotal = exports.setActivityStatusText = exports.setActivityErrored = exports.updateActivity = exports.endActivity = exports.startActivity = exports.setStatus = exports.createPendingActivity = exports.createLog = void 0;

var _redux = require("redux");

var _ = require("./");

var _internalActions = require("./internal-actions");

const actions = {
  createLog: _internalActions.createLog,
  createPendingActivity: _internalActions.createPendingActivity,
  setStatus: _internalActions.setStatus,
  startActivity: _internalActions.startActivity,
  endActivity: _internalActions.endActivity,
  updateActivity: _internalActions.updateActivity,
  setActivityErrored: _internalActions.setActivityErrored,
  setActivityStatusText: _internalActions.setActivityStatusText,
  setActivityTotal: _internalActions.setActivityTotal,
  activityTick: _internalActions.activityTick
};
const boundActions = (0, _redux.bindActionCreators)(actions, _.dispatch);
const createLog = boundActions.createLog;
exports.createLog = createLog;
const createPendingActivity = boundActions.createPendingActivity;
exports.createPendingActivity = createPendingActivity;
const setStatus = boundActions.setStatus;
exports.setStatus = setStatus;
const startActivity = boundActions.startActivity;
exports.startActivity = startActivity;
const endActivity = boundActions.endActivity;
exports.endActivity = endActivity;
const updateActivity = boundActions.updateActivity;
exports.updateActivity = updateActivity;
const setActivityErrored = boundActions.setActivityErrored;
exports.setActivityErrored = setActivityErrored;
const setActivityStatusText = boundActions.setActivityStatusText;
exports.setActivityStatusText = setActivityStatusText;
const setActivityTotal = boundActions.setActivityTotal;
exports.setActivityTotal = setActivityTotal;
const activityTick = boundActions.activityTick;
exports.activityTick = activityTick;