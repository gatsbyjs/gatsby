import { createContext } from "react"
import type { PartytownProps } from "@builder.io/partytown/react"

const PartytownContext: React.Context<{
  collectScript?: (script: PartytownProps) => void
}> = createContext({})

export { PartytownContext }
