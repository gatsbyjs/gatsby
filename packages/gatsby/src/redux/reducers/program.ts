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
}

export const programReducer = (
  state: IStateProgram = initialState,
  action: ActionsUnion
): IStateProgram => {
  switch (action.type) {
    case `DELETE_CACHE`: {
      return {
        ...state,
        firstRun: true,
      }
    }

    case `SET_PROGRAM`:
      return {
        firstRun: false,
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

    default:
      return state
  }
}
