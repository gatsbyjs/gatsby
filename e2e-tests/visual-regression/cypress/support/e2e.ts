import "gatsby-cypress"
import { addMatchImageSnapshotCommand } from "@simonsmith/cypress-image-snapshot/command"

addMatchImageSnapshotCommand({
    customDiffDir: `/__diff_output__`,
    customDiffConfig: {
        threshold: 0.1
    },
    failureThreshold: 0.03,
    failureThresholdType: `percent`
})
