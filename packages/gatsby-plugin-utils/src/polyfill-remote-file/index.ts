import path from "path"
import { SchemaComposer } from "graphql-compose"
import importFrom from "import-from"
import { getRemoteFileEnums } from "./graphql/get-remote-file-enums"
import { getGatsbyVersion } from "./utils/get-gatsby-version"
import { hasFeature } from "../has-feature"
import {
  generatePublicUrlFieldConfig,
  publicUrlResolver,
} from "./graphql/public-url-resolver"
import {
  generateResizeFieldConfig,
  resizeResolver,
} from "./graphql/resize-resolver"
import {
  generateGatsbyImageDataFieldConfig,
  gatsbyImageDataResolver,
} from "./graphql/gatsby-image-data-resolver"

import type { Store } from "gatsby"
import type { InterfaceTypeComposerAsObjectDefinition } from "graphql-compose"
import type { SchemaBuilder, IRemoteFileNode } from "./types"

let enums: ReturnType<typeof getRemoteFileEnums> | undefined

export function getRemoteFileFields(
  enums: ReturnType<typeof getRemoteFileEnums>,
  store: Store
): Record<string, unknown> {
  return {
    id: `ID!`,
    mimeType: `String!`,
    filename: `String!`,
    filesize: `Int`,
    width: `Int`,
    height: `Int`,
    publicUrl: generatePublicUrlFieldConfig(store),
    resize: generateResizeFieldConfig(enums, store),
    gatsbyImageData: generateGatsbyImageDataFieldConfig(enums, store),
  }
}

function addRemoteFilePolyfillInterface<
  T = ReturnType<SchemaBuilder["buildObjectType"]>
>(
  type: T,
  {
    schema,
    store,
  }: {
    schema: SchemaBuilder
    store: Store
  }
): T {
  // When the image-cdn is part of Gatsby we will only add the RemoteFile interface if necessary
  if (hasFeature(`image-cdn`)) {
    // @ts-ignore - wrong typing by typecomposer
    if (!type.config.interfaces.includes(`RemoteFile`)) {
      // @ts-ignore - wrong typing by typecomposer
      type.config.interfaces.push(`RemoteFile`)
    }

    return type
  }

  if (!enums) {
    // We only want to create the enums and interface once
    const composer = new SchemaComposer()
    enums = getRemoteFileEnums(composer.createEnumTC.bind(composer))

    const types: Array<
      | string
      | ReturnType<SchemaBuilder["buildObjectType"]>
      | ReturnType<SchemaBuilder["buildInterfaceType"]>
      | ReturnType<SchemaBuilder["buildEnumType"]>
    > = []

    for (const key in enums) {
      if (enums[key]) {
        types.push(
          schema.buildEnumType({
            name: enums[key].getTypeName(),
            values: enums[key].getFields(),
          })
        )
      }
    }

    types.push(
      schema.buildObjectType({
        name: `RemoteFileResize`,
        fields: {
          width: `Int`,
          height: `Int`,
          src: `String`,
        },
      }),
      schema.buildInterfaceType({
        name: `RemoteFile`,
        interfaces: [`Node`],
        fields: getRemoteFileFields(
          enums,
          store
        ) as InterfaceTypeComposerAsObjectDefinition<
          IRemoteFileNode,
          unknown
        >["fields"],
      })
    )

    // We need to use import-from to remove circular dependency
    const actions = importFrom(
      global.__GATSBY.root ?? process.cwd(),
      `gatsby/dist/redux/actions`
    )
    store.dispatch(
      // @ts-ignore - importFrom doesn't work with types
      actions.createTypes(types, {
        name: `gatsby`,
        version: getGatsbyVersion(),
        resolve: path.join(__dirname, `../`),
      })
    )
  }

  // @ts-ignore - wrong typing by typecomposer
  type.config.interfaces = type.config.interfaces || []
  // @ts-ignore - wrong typing by typecomposer
  if (!type.config.interfaces.includes(`RemoteFile`)) {
    // @ts-ignore - wrong typing by typecomposer
    type.config.interfaces.push(`RemoteFile`)
  }
  // @ts-ignore - wrong typing by typecomposer
  type.config.fields = {
    // @ts-ignore - wrong typing by typecomposer
    ...type.config.fields,
    ...getRemoteFileFields(enums, store),
  }

  return type
}

function isImageCdnEnabled(): boolean {
  return (
    process.env.GATSBY_CLOUD_IMAGE_CDN === `1` ||
    process.env.GATSBY_CLOUD_IMAGE_CDN === `true`
  )
}

export { polyfillImageServiceDevRoutes, addImageRoutes } from "./http-routes"
export {
  getRemoteFileEnums,
  addRemoteFilePolyfillInterface,
  gatsbyImageDataResolver,
  resizeResolver,
  publicUrlResolver,
  isImageCdnEnabled,
}
