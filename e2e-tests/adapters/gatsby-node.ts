import type { GatsbyNode } from "gatsby"

export const createPages: GatsbyNode["createPages"] = ({ actions: { createRedirect } }) => {
  createRedirect({
    fromPath: "/redirect",
    toPath: "/routes/redirect/hit"
  })
  createRedirect({
    fromPath: "/routes/redirect/existing",
    toPath: "/routes/redirect/hit"
  })
}