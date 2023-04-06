import "gatsby-cypress"
import { addMatchImageSnapshotCommand } from "@simonsmith/cypress-image-snapshot/command"
import { register } from "@cypress/snapshot"

addMatchImageSnapshotCommand({
  customDiffDir: `/__diff_output__`,
  customDiffConfig: {
    threshold: 0.1,
  },
  failureThreshold: 0.08,
  failureThresholdType: `percent`,
})

register()
