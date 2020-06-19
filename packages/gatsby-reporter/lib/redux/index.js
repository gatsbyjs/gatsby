"use strict";

exports.__esModule = true;
exports.setStore = exports.onLogAction = exports.onStoreSwap = exports.dispatch = exports.getStore = void 0;

var _redux = require("redux");

var _reducer = require("./reducer");

var _utils = require("./utils");

var _constants = require("../constants");

let store = (0, _redux.createStore)((0, _redux.combineReducers)({
  logs: _reducer.reducer
}), {});
const storeSwapListeners = [];
const onLogActionListeners = new Set();

const getStore = () => store;

exports.getStore = getStore;

const dispatch = action => {
  if (!action) {
    return;
  }

  if (Array.isArray(action)) {
    action.forEach(item => dispatch(item));
    return;
  } else if (typeof action === `function`) {
    action(dispatch);
    return;
  }

  action = { ...action,
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore this is a typescript no-no..
    // And i'm pretty sure this timestamp isn't used anywhere.
    // but for now, the structured logs integration tests expect it
    // so it's easier to leave it and then explore as a follow up
    timestamp: new Date().toJSON()
  };
  store.dispatch(action);

  if ((0, _utils.isInternalAction)(action)) {
    // consumers (ipc, yurnalist, json logger) shouldn't have to
    // deal with actions needed just for internal tracking of status
    return;
  }

  for (const fn of onLogActionListeners) {
    fn(action);
  }
};

exports.dispatch = dispatch;

const onStoreSwap = fn => {
  storeSwapListeners.push(fn);
};

exports.onStoreSwap = onStoreSwap;

const onLogAction = fn => {
  onLogActionListeners.add(fn);
  return () => {
    onLogActionListeners.delete(fn);
  };
};

exports.onLogAction = onLogAction;

const setStore = s => {
  s.dispatch({
    type: _constants.Actions.SetLogs,
    payload: store.getState().logs
  });
  store = s;
  storeSwapListeners.forEach(fn => fn(store));
};

exports.setStore = setStore;