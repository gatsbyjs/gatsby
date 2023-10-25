import * as path from "path"
import type { GatsbyNode, GatsbyConfig } from "gatsby"
import { applyTrailingSlashOption } from "./utils"

const TRAILING_SLASH = (process.env.TRAILING_SLASH ||
  `never`) as GatsbyConfig["trailingSlash"]

export const createPages: GatsbyNode["createPages"] = ({
  actions: { createRedirect, createSlice },
}) => {
  createRedirect({
    fromPath: applyTrailingSlashOption("/redirect", TRAILING_SLASH),
    toPath: applyTrailingSlashOption("/routes/redirect/hit", TRAILING_SLASH),
  })
  createRedirect({
    fromPath: applyTrailingSlashOption(
      "/routes/redirect/existing",
      TRAILING_SLASH
    ),
    toPath: applyTrailingSlashOption("/routes/redirect/hit", TRAILING_SLASH),
  })
  createRedirect({
    fromPath: applyTrailingSlashOption(
      "/routes/redirect/existing-force",
      TRAILING_SLASH
    ),
    toPath: applyTrailingSlashOption("/routes/redirect/hit", TRAILING_SLASH),
    force: true,
  })
  createRedirect({
    fromPath: applyTrailingSlashOption(
      "/routes/redirect/country-condition",
      TRAILING_SLASH
    ),
    toPath: applyTrailingSlashOption("/routes/redirect/hit-us", TRAILING_SLASH),
    conditions: {
      country: ["us"],
    },
  })
  createRedirect({
    fromPath: applyTrailingSlashOption(
      "/routes/redirect/country-condition",
      TRAILING_SLASH
    ),
    toPath: applyTrailingSlashOption("/routes/redirect/hit-de", TRAILING_SLASH),
    conditions: {
      country: ["de"],
    },
  })
  // fallback if not matching a country condition
  createRedirect({
    fromPath: applyTrailingSlashOption(
      "/routes/redirect/country-condition",
      TRAILING_SLASH
    ),
    toPath: applyTrailingSlashOption("/routes/redirect/hit", TRAILING_SLASH),
  })

  createSlice({
    id: `footer`,
    component: path.resolve(`./src/components/footer.jsx`),
    context: {},
  })
}
