import React from "react"
import { Provider } from "urql"
import client from "../urql-client"

export default ({ children }): React.ReactElement => (
  <Provider value={client}>{children}</Provider>
)
