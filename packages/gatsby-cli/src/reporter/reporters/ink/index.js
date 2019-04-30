import React from "react"
import { render } from "ink"
import GatsbyReporter from "./reporter"

// render the react component and expose it so it can be changed from the outside world
const inkReporter = React.createRef()
render(<GatsbyReporter ref={inkReporter} />)

export default /** @type {GatsbyReporter} */ (inkReporter.current)
