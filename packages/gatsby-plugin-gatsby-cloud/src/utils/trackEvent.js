const pkgjson = require(`../package.json`)

export default async function trackEvent({
  eventType,
  orgId,
  siteId,
  buildId,
  name,
}) {
  if (process.env.GATSBY_TELEMETRY_API) {
    try {
      const body = {
        time: new Date(),
        eventType,
        componentId: `gatsby-plugin-gatsby-cloud_preview-indicator`,
        version: 1,
        componentVersion: pkgjson.version,
        organizationId: orgId,
        siteId,
        buildId,
        name,
      }

      const res = await fetch(process.env.GATSBY_TELEMETRY_API, {
        mode: `cors`,
        method: `POST`,
        headers: {
          "Content-Type": `application/json`,
        },
        body: JSON.stringify(body),
      })
    } catch (e) {
      console.log(e, e.message)
    }
  }
}
