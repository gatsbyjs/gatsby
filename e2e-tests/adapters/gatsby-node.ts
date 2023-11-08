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

// Image CDN
exports.createSchemaCustomization = function createSchemaCustomization({
  actions,
}) {
  actions.createTypes(`
    type UnsplashImage implements Node & RemoteFile {
      id: ID!
    }

    type DeployedLocalImage implements Node & RemoteFile {
      id: ID!
    }
  `)
}

exports.sourceNodes = function sourceNodes({ actions }) {
  {
    const imageURL = `https://images.unsplash.com/photo-1672823841196-3ec078a2befd`
    actions.createNode({
      id: "unsplash-image-1",
      internal: {
        type: "UnsplashImage",
        contentDigest: `1`,
      },
      url: imageURL,
      filename: imageURL,
      mimeType: `image/jpeg`,
      width: 1940,
      height: 3118,
    })
  }

  {
    const imageURL = `${process.env.DEPLOY_URL}/images/cornwall.jpg`
    actions.createNode({
      id: "deployed-local-image-1",
      internal: {
        type: "DeployedLocalImage",
        contentDigest: `1`,
      },
      url: imageURL,
      filename: imageURL,
      mimeType: `image/jpeg`,
      width: 2400,
      height: 1136,
    })
  }

  {
    const imageURL = `${process.env.DEPLOY_URL}/images/landsend.jpg`
    actions.createNode({
      id: "deployed-local-image-2",
      internal: {
        type: "DeployedLocalImage",
        contentDigest: `2`,
      },
      url: imageURL,
      filename: imageURL,
      mimeType: `image/jpeg`,
      width: 640,
      height: 480,
    })
  }
}
