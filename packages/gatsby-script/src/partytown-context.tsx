import { createContext } from "react"
import { ScriptProps } from "./gatsby-script"

const PartytownContext: React.Context<{
  collectScript?: (script: ScriptProps) => void
}> = createContext({})

export { PartytownContext }
