import { hasFeature } from "gatsby-plugin-utils"

export const hasStatefulSourceNodes = hasFeature(`stateful-source-nodes`)
export const needToTouchNodes = !hasStatefulSourceNodes
