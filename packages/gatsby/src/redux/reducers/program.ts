import type { IProgram } from "../../commands/types"
// import { reporter } from "gatsby-cli/src/reporter/reporter"

const initialState: IProgram = {
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
  // FIXME: resolve the TS error when instantiating a reporter instance here
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore-next-line
  report: {},
}

type ActionTypes =
  | `SET_PROGRAM`
  | `SET_PROGRAM_EXTENSIONS`
  | `SET_PROGRAM_STATUS`

export const programReducer = (
  state: IProgram = initialState,
  action: { type: ActionTypes; payload: IProgram | string[] }
): IProgram => {
  switch (action.type) {
    case `SET_PROGRAM`:
      return {
        ...action.payload,
      } as IProgram

    case `SET_PROGRAM_EXTENSIONS`:
      return {
        ...(state as IProgram),
        extensions: action.payload as string[],
      }

    case `SET_PROGRAM_STATUS`:
      return {
        ...(state as IProgram),
        status: `BOOTSTRAP_FINISHED`,
      }

    default:
      return state
  }
}
