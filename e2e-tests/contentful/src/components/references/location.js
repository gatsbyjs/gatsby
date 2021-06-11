import React from "react"

export const ContentfulContentTypeLocation = ({ location }) => (
  <p data-cy-id="location">
    [ContentfulContentTypeLocation] Lat: {location.lat}, Long: {location.lon}
  </p>
)
