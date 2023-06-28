import * as path from "path"
import type { GatsbyNode } from "gatsby"

export const createPages: GatsbyNode["createPages"] = ({ actions: { createRedirect, createSlice } }) => {
  createRedirect({
    fromPath: "/redirect",
    toPath: "/routes/redirect/hit"
  })
  createRedirect({
    fromPath: "/routes/redirect/existing",
    toPath: "/routes/redirect/hit"
  })

  createSlice({
    id: `footer`,
    component: path.resolve(`./src/components/footer.jsx`),
    context: {},
  })
}