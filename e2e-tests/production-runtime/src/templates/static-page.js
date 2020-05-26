import * as React from "react"

import InstrumentPage from "../utils/instrument-page"

const StaticPage = () => (
  <pre data-testid="dom-marker">[client-only-path] static-sibling</pre>
)

export default InstrumentPage(StaticPage)
