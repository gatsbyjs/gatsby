import { combineReducers } from "redux"
import darkMode from "./reducers/darkMode"
import dummy from "./reducers/dummy"

export default combineReducers({ darkMode, dummy })
