import * as React from "react"
import { ToolbarButton } from "@graphiql/react"

export const RefreshDataSourceButton = ({ onClick }) => (
  <ToolbarButton onClick={onClick} label="Refresh Data Source">
    RDS
  </ToolbarButton>
)
