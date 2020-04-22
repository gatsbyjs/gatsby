import * as React from "react"

import InstrumentPage from "../utils/instrument-page"

const StaticPage = ({ pageContext }) => (
  <pre data-testid="dom-marker">{pageContext.domMarker}</pre>
)

export default InstrumentPage(StaticPage)
