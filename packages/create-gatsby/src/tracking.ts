import { v4 as uuidv4 } from "@lukeed/uuid";
import { getConfigStore } from "./utils/get-config-store";
import { isTruthy } from "./utils/is-truthy";
import { version } from "../package.json"; // with { type: "json" };

const store = getConfigStore();
const analyticsApi =
  process.env.GATSBY_TELEMETRY_API || "https://analytics.gatsbyjs.com/events";
let trackingEnabled: boolean | undefined;
const trackingDisabledFromEnvVar: boolean | undefined = isTruthy(
  process.env.GATSBY_TELEMETRY_DISABLED,
);

function getMachineId(): string {
  let machineId = store.get("telemetry.machineId");

  if (typeof machineId !== "string") {
    machineId = uuidv4();
    store.set("telemetry.machineId", machineId);
  }

  return machineId;
}

export type ITrackCliArgs = {
  name?: string | undefined;
  valueString?: string | undefined;
  exitCode?: number | undefined;
  valueStringArray?: Array<string> | undefined;
  siteHash?: string | undefined;
};

const sessionId = uuidv4();

// Adapted from gatsby-telemetry
export function isTrackingEnabled(): boolean {
  // Cache the result
  if (trackingEnabled !== undefined) {
    return trackingEnabled;
  }

  let enabled = store.get("telemetry.enabled") as boolean | null;

  if (enabled === undefined || enabled === null) {
    enabled = true;
    store.set("telemetry.enabled", enabled);
  }

  if (trackingDisabledFromEnvVar) {
    enabled = false;
  }

  trackingEnabled = enabled;

  return enabled;
}

export function trackCli(
  eventType: string,
  args?: ITrackCliArgs | undefined,
): void {
  if (!isTrackingEnabled()) {
    return;
  }

  fetch(analyticsApi, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": `create-gatsby:${version}`,
    },
    body: JSON.stringify({
      eventType,
      time: new Date(),
      sessionId,
      machineId: getMachineId(),
      componentId: "create-gatsby",
      componentVersion: 1,
      gatsbyCliVersion: version,
      ...args,
    }),
  }).catch(() => {}); /* do nothing, it's telemetry */
}
