import { GatsbyNode } from "gatsby"
import { working } from "../../utils/say-what-ts"

export const onPreInit: GatsbyNode["onPreInit"] = ({ reporter }) => {
  reporter.info(working)
}