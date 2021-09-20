import fetch from "node-fetch"
import uuidv4 from "uuid/v4"
import { getConfigStore } from "./get-config-store"

const store = getConfigStore()
const gatsbyCliVersion = require(`../package.json`).version
const analyticsApi =
  process.env.GATSBY_TELEMETRY_API || `https://analytics.gatsbyjs.com/events`

const getMachineId = (): string => {
  let machineId = store.get(`telemetry.machineId`)

  if (typeof machineId !== `string`) {
    machineId = uuidv4()
    store.set(`telemetry.machineId`, machineId)
  }

  return machineId
}

export interface ITrackCliArgs {
  name?: string
  valueString?: string
  exitCode?: number
  valueStringArray?: Array<string>
  siteHash?: string
}

const sessionId = uuidv4()

export const trackCli = (eventType: string, args?: ITrackCliArgs): void => {
  fetch(analyticsApi, {
    method: `POST`,
    headers: {
      "content-type": `application/json`,
      "user-agent": `create-gatsby:${gatsbyCliVersion}`,
    },
    body: JSON.stringify({
      eventType,
      time: new Date(),
      sessionId,
      machineId: getMachineId(),
      componentId: `create-gatsby`,
      componentVersion: 1,
      gatsbyCliVersion,
      ...args,
    }),
  }).catch(() => {}) /* do nothing, it's telemetry */
}
