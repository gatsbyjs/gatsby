import { Express } from "express"
import { writeModule } from "./gatsby-webpack-virtual-modules"

let indicatorEnabled = true

function writeVirtualLoadingIndicatorModule(): void {
  writeModule(
    `$virtual/loading-indicator.js`,
    `export function isLoadingIndicatorEnabled() {
    return ${JSON.stringify(indicatorEnabled)}
  }`
  )
}

export function routeLoadingIndicatorRequests(app: Express): void {
  writeVirtualLoadingIndicatorModule()

  app.get(`/___loading-indicator/:method?`, (req, res) => {
    if (req.params.method === `enable` && !indicatorEnabled) {
      indicatorEnabled = true
      writeVirtualLoadingIndicatorModule()
    } else if (req.params.method === `disable` && indicatorEnabled) {
      indicatorEnabled = false
      writeVirtualLoadingIndicatorModule()
    }

    res.send({
      status: indicatorEnabled ? `enabled` : `disabled`,
    })
  })
}
