import React, { Suspense } from "react"

import * as resources from "../resources"

import { ResourceComponent } from "./render"

export const resourceComponents = Object.keys(resources).reduce(
  (acc, resourceName) => {
    acc[resourceName] = props => (
      <Suspense fallback={<p>Reading {resourceName}...</p>}>
        <ResourceComponent _resourceName={resourceName} {...props} />
      </Suspense>
    )

    // Make sure the component is pretty printed in reconciler output
    acc[resourceName].displayName = resourceName

    return acc
  },
  {}
)
