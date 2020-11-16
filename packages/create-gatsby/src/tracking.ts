import fetch from "node-fetch"
import { v4 as uuidv4 } from "uuid"
import { getConfigStore } from "./get-config-store"

const store = getConfigStore()
const gatsbyCliVersion = require(`../package.json`).version
const analyticsApi =
  process.env.GATSBY_TELEMETRY_API || `https://analytics.gatsbyjs.com/events`

let machineId = store.get(`telemetry.machineId`)
const getMachineId = (): string => {
  if (typeof machineId === `string`) {
    return machineId
  }

  machineId = uuidv4()
  store.set(`telemetry.machineId`, machineId)
  return machineId
}

export interface ITrackCliArgs {
  name?: string
  valueString?: string
  exitCode?: number
  valueStringArray?: Array<string>
}

export const trackCli = (eventType: string, args?: ITrackCliArgs): void => {
  fetch(analyticsApi, {
    method: `POST`,
    headers: {
      "content-type": `application/json`,
      "user-agent": `Gatsby Telemetry`,
    },
    body: JSON.stringify({
      eventType,
      time: new Date(),
      sessionId: uuidv4(),
      machineId: getMachineId(),
      componentId: `create-gatsby`,
      componentVersion: 1,
      gatsbyCliVersion,
      ...args,
    }),
  }).catch(() => {}) /* do nothing, it's telemetry */
}
