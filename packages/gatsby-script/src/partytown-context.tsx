import { createContext } from "react"
import type { PartytownProps } from "@builder.io/partytown/react"

const PartytownContext: React.Context<{
  collectedScripts?: Array<PartytownProps>
  collectScript?: (state: PartytownProps) => void
}> = createContext({})

export { PartytownContext }
