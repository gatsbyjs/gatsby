import { IStateProgram, ActionsUnion } from "../types"
import { reporter } from "gatsby-cli/lib/reporter/reporter"

const initialState: IStateProgram = {
  directory: `/`,
  status: `BOOTSTRAPPING`,
  _: `develop`,
  useYarn: false,
  open: false,
  openTracingConfigFile: ``,
  port: 80,
  proxyPort: 80,
  host: `localhost`,
  sitePackageJson: {},
  extensions: [],
  browserslist: [],
  report: reporter,
  disablePlugins: [],
}

export const programReducer = (
  state: IStateProgram = initialState,
  action: ActionsUnion
): IStateProgram => {
  switch (action.type) {
    case `SET_PROGRAM`:
      return {
        ...state,
        ...action.payload,
      }

    case `SET_PROGRAM_EXTENSIONS`:
      return {
        ...state,
        extensions: action.payload,
      }

    case `SET_PROGRAM_STATUS`:
      return {
        ...state,
        status: `BOOTSTRAP_FINISHED`,
      }

    case `DISABLE_PLUGINS_BY_NAME`: {
      if (!state.disablePlugins) {
        state.disablePlugins = []
      }
      for (const pluginToDisable of action.payload.pluginsToDisable) {
        let disabledPlugin = state.disablePlugins.find(
          entry => entry.name === pluginToDisable
        )
        if (!disabledPlugin) {
          disabledPlugin = {
            name: pluginToDisable,
            reasons: [],
          }
          state.disablePlugins.push(disabledPlugin)
        }
        disabledPlugin.reasons.push(action.payload.reason)
      }

      return state
    }

    default:
      return state
  }
}
