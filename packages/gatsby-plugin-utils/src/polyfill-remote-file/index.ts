import path from "path"
import { SchemaComposer } from "graphql-compose"
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
  generateGatsbyImageFieldConfig,
  gatsbyImageResolver,
} from "./graphql/gatsby-image-resolver"

import type { Actions, Store } from "gatsby"
import type { InterfaceTypeComposerAsObjectDefinition } from "graphql-compose"
import type { SchemaBuilder, IRemoteFileNode } from "./types"

let enums: ReturnType<typeof getRemoteFileEnums> | undefined

export function getRemoteFileFields(
  enums: ReturnType<typeof getRemoteFileEnums>,
  actions: Actions,
  store?: Store
): Record<string, unknown> {
  return {
    id: `ID!`,
    mimeType: `String!`,
    filename: `String!`,
    filesize: `Int`,
    width: `Int`,
    height: `Int`,
    publicUrl: generatePublicUrlFieldConfig(actions, store),
    resize: generateResizeFieldConfig(enums, actions, store),
    gatsbyImage: generateGatsbyImageFieldConfig(enums, actions, store),
  }
}

function addRemoteFilePolyfillInterface<
  T = ReturnType<SchemaBuilder["buildObjectType"]>
>(
  type: T,
  {
    schema,
    actions,
    store,
  }: {
    schema: SchemaBuilder
    actions: Actions
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
        fields: getRemoteFileFields(
          enums,
          actions,
          store
        ) as InterfaceTypeComposerAsObjectDefinition<
          IRemoteFileNode,
          unknown
        >["fields"],
      })
    )

    actions.createTypes(types, {
      name: `gatsby`,
      // @ts-ignore - version is allowed
      version: getGatsbyVersion(),
      resolve: path.join(__dirname, `../`),
    })
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
    ...getRemoteFileFields(enums, actions, store),
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
  gatsbyImageResolver,
  resizeResolver,
  publicUrlResolver,
  isImageCdnEnabled,
}
