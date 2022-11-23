import React from "react"

export const ContentfulLocation = ({ location }) => (
  <p data-cy-id="location">
    [ContentfulLocation] Lat: {location.lat}, Long: {location.lon}
  </p>
)
