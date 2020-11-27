// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import "gatsby-cypress"
import { addMatchImageSnapshotCommand } from "cypress-image-snapshot/command"

addMatchImageSnapshotCommand({
    customDiffDir: `/__diff_output__`,
    customDiffConfig: {
        threshold: 0.1
    },
    failureThreshold: 0.03,
    failureThresholdType: `percent`
})
