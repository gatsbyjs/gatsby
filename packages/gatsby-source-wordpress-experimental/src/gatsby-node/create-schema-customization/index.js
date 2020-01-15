import store from "../../store"
import { getContentTypeQueryInfos } from "../source-nodes/fetch-nodes"
import { getPluginOptions } from "../../utils/get-gatsby-api"
import { createRemoteMediaItemNode } from "../source-nodes/create-remote-media-item-node"

/**
 * Transforms fields from the WPGQL schema to work in the Gatsby schema
 * with proper node linking and type namespacing
 * also filters out unusable fields and types
 */
const transformFields = ({
  fields,
  gatsbyNodeTypes,
  fieldAliases,
  fieldBlacklist,
}) => {
  if (!fields || !fields.length) {
    return null
  }

  return fields.reduce((accumulator, current) => {
    // this is used to alias fields that conflict with Gatsby node fields
    // for ex Gatsby and WPGQL both have a `parent` field
    const name =
      fieldAliases && fieldAliases[current.name]
        ? fieldAliases[current.name]
        : current.name

    // skip blacklisted fields
    if (fieldBlacklist.includes(name)) {
      return accumulator
    }

    // skip fields that have required arguments
    if (
      current.args &&
      current.args.find(arg => arg.type.kind === `NON_NULL`)
    ) {
      return accumulator
    }

    // if we don't have any typenames we can't use this
    if (!current.type.name && !current.type.ofType.name) {
      return accumulator
    }

    if (
      current.type.kind === `NON_NULL` &&
      current.type.ofType.kind === `OBJECT`
    ) {
      return accumulator
    }

    if (
      current.type.kind === `NON_NULL` &&
      current.type.ofType.kind === `ENUM`
    ) {
      return accumulator
    }

    if (
      current.type &&
      current.type.name &&
      current.type.name.includes(`Connection`)
    ) {
      accumulator[name] = `Wp${current.type.name}`
      return accumulator
    }

    // non null scalar types
    if (
      current.type.kind === `NON_NULL` &&
      current.type.ofType.kind === `SCALAR`
    ) {
      accumulator[name] = `${current.type.ofType.name}!`
      return accumulator
    }

    // non null list types
    if (
      current.type.kind === `NON_NULL` &&
      current.type.ofType.kind === `LIST`
    ) {
      if (!current.type.ofType.name) {
        return accumulator
      }

      accumulator[name] = `[${current.type.ofType.name}]!`
      return accumulator
    }

    // scalar types
    if (current.type.kind === `SCALAR`) {
      accumulator[name] = current.type.name
      return accumulator
    }

    const typeName = `Wp${current.type.name}`
    const isAGatsbyNode = gatsbyNodeTypes.includes(current.type.name)

    // link gatsby nodes by id
    if (current.type.kind === `OBJECT` && isAGatsbyNode) {
      accumulator[name] = {
        type: typeName,
        resolve: (source, args, context, info) => {
          const field = source[name]

          if (!field || (field && !field.id)) {
            return null
          }

          return context.nodeModel.getNodeById({
            id: field.id,
            type: typeName,
          })
        },
      }

      return accumulator

      // for other object types, just use the default resolver
    } else if (current.type.kind === `OBJECT` && !isAGatsbyNode) {
      accumulator[name] = {
        type: typeName,
      }

      return accumulator
    }

    if (current.type.kind === `LIST`) {
      const type = `Wp${current.type.ofType.name}`

      if (current.type.ofType.kind === `OBJECT`) {
        accumulator[name] = {
          type: `[${type}]`,
          resolve: (source, args, context, info) => {
            if (source.nodes.length) {
              return context.nodeModel.getNodesByIds({
                ids: source.nodes.map(node => node.id),
                type,
              })
            } else {
              return null
            }
          },
        }
        return accumulator
      }

      // link unions of Gatsby nodes by id
      if (current.type.ofType.kind === `UNION`) {
        accumulator[name] = {
          type: `[${type}]`,
          resolve: (source, args, context, info) => {
            const field = source[name]

            if (!field || !field.length) {
              return null
            }

            return field.map(item => {
              const node = context.nodeModel.getNodeById({
                id: item.id,
                type: `Wp${item.__typename}`,
              })

              if (node) {
                return node
              }

              return item
            })
          },
        }

        return accumulator
      }

      if (current.type.ofType.kind === `SCALAR`) {
        accumulator[name] = {
          type: `[${current.type.ofType.name}]`,
        }

        return accumulator
      }

      if (current.type.ofType.kind === `INTERFACE`) {
        accumulator[name] = {
          type: `[Wp${current.type.name}]`,
        }

        return accumulator
      }
    }

    if (current.type.kind === `UNION`) {
      accumulator[name] = {
        type: `Wp${current.type.name}`,
        resolve: (source, args, context, info) => {
          const field = source[name]

          if (!field || !field.id) {
            return null
          }

          return context.nodeModel.getNodeById({
            id: field.id,
            type: field.type,
          })
        },
      }
      return accumulator
    }

    if (current.type.kind === `INTERFACE`) {
      accumulator[name] = {
        type: `Wp${current.type.name}`,
      }

      return accumulator
    }

    // unhandled fields are removed from the schema by not mutating the accumulatorumulator
    return accumulator
  }, {})
}

/**
 * createSchemaCustomization
 */
export default async ({ actions, schema }) => {
  schema.buildInterfaceType({
    kind: "INTERFACE",
    config: { name: "WpNode", fields: { id: "ID!" } },
  })
  schema.buildInterfaceType({
    kind: "INTERFACE",
    config: {
      name: "WpTermNode",
      fields: {
        count: "Int",
        databaseId: "Int",
        description: "String",
        id: "ID!",
        link: "String",
        name: "String",
        slug: "String",
        taxonomy: { type: "WpTaxonomy" },
        termGroupId: "Int",
        termTaxonomyId: "Int",
        uri: "String",
      },
    },
  })
  // schema.buildInterfaceType({
  //   kind: "INTERFACE",
  //   config: {
  //     name: "WpContentNode",
  //     fields: {
  //       databaseId: "Int!",
  //       date: "String",
  //       dateGmt: "String",
  //       desiredSlug: "String",
  //       enclosure: "String",
  //       guid: "String",
  //       id: "ID!",
  //       link: "String",
  //       modified: "String",
  //       modifiedGmt: "String",
  //       slug: "String",
  //       status: "String",
  //       termNames: { type: "[String]" },
  //       termSlugs: { type: "[String]" },
  //       terms: { type: "[WpTermObjectUnion]" },
  //       uri: "String",
  //     },
  //   },
  // })
  actions.createTypes([
    {
      kind: "INTERFACE",
      config: {
        name: "WpContentNodeInterface",
        fields: {
          databaseId: "Int!",
          date: "String",
          dateGmt: "String",
          desiredSlug: "String",
          enclosure: "String",
          guid: "String",
          id: "ID!",
          link: "String",
          modified: "String",
          modifiedGmt: "String",
          slug: "String",
          status: "String",
          termNames: { type: "[String]" },
          termSlugs: { type: "[String]" },
          terms: { type: "[WpTermObjectUnion]" },
          uri: "String",
        },
        extensions: { infer: false, nodeInterface: {} },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpContentNode",
        fields: {
          databaseId: "Int!",
          date: "String",
          dateGmt: "String",
          desiredSlug: "String",
          enclosure: "String",
          guid: "String",
          id: "ID!",
          link: "String",
          modified: "String",
          modifiedGmt: "String",
          slug: "String",
          status: "String",
          termNames: { type: "[String]" },
          termSlugs: { type: "[String]" },
          terms: { type: "[WpTermObjectUnion]" },
          uri: "String",
        },
        extensions: { infer: false, nodeInterface: {} },
        interfaces: [`Node`, `WpContentNodeInterface`],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpActionMonitorAction",
        fields: {
          actionType: "String",
          databaseId: "Int!",
          date: "String",
          dateGmt: "String",
          desiredSlug: "String",
          enclosure: "String",
          guid: "String",
          id: "ID!",
          link: "String",
          modified: "String",
          modifiedGmt: "String",
          referencedPostGlobalRelayID: "String",
          referencedPostID: "String",
          referencedPostPluralName: "String",
          referencedPostSingularName: "String",
          referencedPostStatus: "String",
          slug: "String",
          status: "String",
          template: { type: "WpContentTemplateUnion" },
          title: "String",
          uri: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUser",
        fields: {
          avatar: { type: "WpAvatar" },
          capKey: "String",
          capabilities: { type: "[String]" },
          comments: "WpUserToCommentConnection",
          databaseId: "String!",
          description: "String",
          email: "String",
          extraCapabilities: { type: "[String]" },
          firstName: "String",
          id: "ID!",
          lastName: "String",
          locale: "String",
          mediaItems: "WpUserToMediaItemConnection",
          name: "String",
          nicename: "String",
          nickname: "String",
          pages: "WpUserToPageConnection",
          posts: "WpUserToPostConnection",
          registeredDate: "String",
          roles: "WpUserToUserRoleConnection",
          slug: "String",
          uri: "String!",
          url: "String",
          userId: "Int",
          username: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "INTERFACE",
      config: {
        name: "WpUniformResourceIdentifiable",
        fields: { databaseId: "String!", id: "String!", uri: "String!" },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToActionMonitorActionConnection",
        fields: {
          nodes: { type: "[WpActionMonitorAction]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToActionMonitorActionConnectionEdge",
        fields: { cursor: "String", node: { type: "WpActionMonitorAction" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpWPPageInfo",
        fields: {
          endCursor: "String",
          hasNextPage: "Boolean!",
          hasPreviousPage: "Boolean!",
          startCursor: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostType",
        fields: {
          canExport: "Boolean",
          connectedTaxonomies: { type: "[WpTaxonomy]" },
          connectedTaxonomyNames: { type: "[String]" },
          deleteWithUser: "Boolean",
          description: "String",
          excludeFromSearch: "Boolean",
          graphqlPluralName: "String",
          graphqlSingleName: "String",
          hasArchive: "Boolean",
          hierarchical: "Boolean",
          id: "ID!",
          label: "String",
          labels: { type: "WpPostTypeLabelDetails" },
          menuIcon: "String",
          menuPosition: "Int",
          name: "String",
          public: "Boolean",
          publiclyQueryable: "Boolean",
          restBase: "String",
          restControllerClass: "String",
          showInAdminBar: "Boolean",
          showInGraphql: "Boolean",
          showInMenu: "Boolean",
          showInNavMenus: "Boolean",
          showInRest: "Boolean",
          showUi: "Boolean",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpTaxonomy",
        fields: {
          connectedPostTypeNames: { type: "[String]" },
          description: "String",
          graphqlPluralName: "String",
          graphqlSingleName: "String",
          hierarchical: "Boolean",
          id: "ID!",
          label: "String",
          name: "String",
          public: "Boolean",
          restBase: "String",
          restControllerClass: "String",
          showCloud: "Boolean",
          showInAdminColumn: "Boolean",
          showInGraphql: "Boolean",
          showInMenu: "Boolean",
          showInNavMenus: "Boolean",
          showInQuickEdit: "Boolean",
          showInRest: "Boolean",
          showUi: "Boolean",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostTypeLabelDetails",
        fields: {
          addNew: "String",
          addNewItem: "String",
          allItems: "String",
          archives: "String",
          attributes: "String",
          editItem: "String",
          featuredImage: "String",
          filterItemsList: "String",
          insertIntoItem: "String",
          itemsList: "String",
          itemsListNavigation: "String",
          menuName: "String",
          name: "String",
          newItem: "String",
          notFound: "String",
          notFoundInTrash: "String",
          parentItemColon: "String",
          removeFeaturedImage: "String",
          searchItems: "String",
          setFeaturedImage: "String",
          singularName: "String",
          uploadedToThisItem: "String",
          useFeaturedImage: "String",
          viewItem: "String",
          viewItems: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpAvatar",
        fields: {
          default: "String",
          extraAttr: "String",
          forceDefault: "Boolean",
          foundAvatar: "Boolean",
          height: "Int",
          rating: "String",
          scheme: "String",
          size: "Int",
          url: "String",
          width: "Int",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToCommentConnection",
        fields: {
          nodes: { type: "[WpComment]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToCommentConnectionEdge",
        fields: { cursor: "String", node: { type: "WpComment" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpComment",
        fields: {
          agent: "String",
          approved: "Boolean",
          author: { type: "WpCommentAuthorUnion" },
          authorIp: "String",
          wpChildren: "WpCommentToCommentConnection",
          commentId: "Int",
          commentedOn: { type: "WpPostObjectUnion" },
          content: "String",
          date: "String",
          dateGmt: "String",
          id: "ID!",
          karma: "Int",
          wpParent: { type: "WpComment" },
          type: "String",
        },
        extensions: { infer: false },
        interfaces: ["Node"],
      },
    },
    {
      kind: "UNION",
      config: {
        name: "WpCommentAuthorUnion",
        types: ["WpUser", "WpCommentAuthor"],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpCommentAuthor",
        fields: { email: "String", id: "ID!", name: "String", url: "String" },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpCommentToCommentConnection",
        fields: {
          nodes: { type: "[WpComment]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpCommentToCommentConnectionEdge",
        fields: { cursor: "String", node: { type: "WpComment" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: {
        name: "WpPostObjectUnion",
        types: ["WpPost", "WpPage", "WpMediaItem", "WpActionMonitorAction"],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost",
        fields: {
          acfGroup: { type: "WpPost_Acfgroup" },
          author: { type: "WpUser" },
          categories: "WpPostToCategoryConnection",
          commentCount: "Int",
          commentStatus: "String",
          comments: "WpPostToCommentConnection",
          content: "String",
          databaseId: "Int!",
          date: "String",
          dateGmt: "String",
          desiredSlug: "String",
          enclosure: "String",
          excerpt: "String",
          featuredImage: { type: "WpMediaItem" },
          guid: "String",
          id: "ID!",
          isRevision: "Boolean",
          link: "String",
          modified: "String",
          modifiedGmt: "String",
          pingStatus: "String",
          pinged: { type: "[String]" },
          postFormats: "WpPostToPostFormatConnection",
          revisionOf: { type: "WpPostObjectUnion" },
          slug: "String",
          status: "String",
          tags: "WpPostToTagConnection",
          template: { type: "WpContentTemplateUnion" },
          termNames: { type: "[String]" },
          termSlugs: { type: "[String]" },
          terms: { type: "[WpTermObjectUnion]" },
          title: "String",
          toPing: { type: "[String]" },
          uri: "String",
        },
        extensions: { infer: false },
        interfaces: ["Node"],
      },
    },
    {
      kind: "INTERFACE",
      config: { name: "WpNodeWithTitle", fields: { title: "String" } },
    },
    {
      kind: "INTERFACE",
      config: {
        name: "WpNodeWithContentEditor",
        fields: { content: "String" },
      },
    },
    {
      kind: "INTERFACE",
      config: {
        name: "WpNodeWithAuthor",
        fields: { author: { type: "WpUser" } },
      },
    },
    {
      kind: "INTERFACE",
      config: {
        name: "WpNodeWithFeaturedImage",
        fields: { featuredImage: { type: "WpMediaItem" } },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMediaItem",
        fields: {
          altText: "String",
          ancestors: { type: "[WpPostObjectUnion]" },
          author: { type: "WpUser" },
          caption: "String",
          commentCount: "Int",
          commentStatus: "String",
          comments: "WpMediaItemToCommentConnection",
          databaseId: "Int!",
          date: "String",
          dateGmt: "String",
          description: "String",
          desiredSlug: "String",
          enclosure: "String",
          guid: "String",
          id: "ID!",
          link: "String",
          mediaDetails: { type: "WpMediaDetails" },
          mediaItemUrl: "String",
          mediaType: "String",
          mimeType: "String",
          modified: "String",
          modifiedGmt: "String",
          wpParent: { type: "WpPostObjectUnion" },
          sizes: "String",
          slug: "String",
          sourceUrl: "String",
          srcSet: "String",
          status: "String",
          template: { type: "WpContentTemplateUnion" },
          title: "String",
          uri: "String",
          remoteFile: { type: "File" },
        },
        extensions: { infer: false },
        interfaces: ["Node"],
      },
    },
    {
      kind: "INTERFACE",
      config: {
        name: "WpNodeWithComments",
        fields: { commentCount: "Int", commentStatus: "String" },
      },
    },
    {
      kind: "INTERFACE",
      config: {
        name: "WpHierarchicalContentNode",
        fields: {
          ancestors: { type: "[WpPostObjectUnion]" },
          wpParent: { type: "WpPostObjectUnion" },
        },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMediaItemToCommentConnection",
        fields: {
          nodes: { type: "[WpComment]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMediaItemToCommentConnectionEdge",
        fields: { cursor: "String", node: { type: "WpComment" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpEditLock",
        fields: { editTime: "String", user: { type: "WpUser" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMediaDetails",
        fields: {
          file: "String",
          height: "Int",
          meta: { type: "WpMediaItemMeta" },
          sizes: { type: "[WpMediaSize]" },
          width: "Int",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMediaItemMeta",
        fields: {
          aperture: "Float",
          camera: "String",
          caption: "String",
          copyright: "String",
          createdTimestamp: "Int",
          credit: "String",
          focalLength: "Int",
          iso: "Int",
          keywords: { type: "[String]" },
          orientation: "String",
          shutterSpeed: "Float",
          title: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMediaSize",
        fields: {
          file: "String",
          height: "String",
          mimeType: "String",
          name: "String",
          sourceUrl: "String",
          width: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: {
        name: "WpContentTemplateUnion",
        types: [
          "WpDefaultTemplate",
          "WpCoverTemplateTemplate",
          "WpFullWidthTemplateTemplate",
        ],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpDefaultTemplate",
        fields: { templateName: "String" },
        extensions: { infer: false },
      },
    },
    {
      kind: "INTERFACE",
      config: { name: "WpContentTemplate", fields: { templateName: "String" } },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpCoverTemplateTemplate",
        fields: { templateName: "String" },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpFullWidthTemplateTemplate",
        fields: { templateName: "String" },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: {
        name: "WpTermObjectUnion",
        types: ["WpCategory", "WpTag", "WpPostFormat"],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpCategory",
        fields: {
          ancestors: { type: "[WpCategory]" },
          wpChildren: "WpCategoryToCategoryConnection",
          count: "Int",
          databaseId: "Int",
          description: "String",
          id: "ID!",
          link: "String",
          name: "String",
          wpParent: { type: "WpCategory" },
          posts: "WpCategoryToPostConnection",
          slug: "String",
          taxonomy: { type: "WpTaxonomy" },
          termGroupId: "Int",
          termTaxonomyId: "Int",
          uri: "String",
        },
        extensions: { infer: false },
        interfaces: ["Node"],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpCategoryToCategoryConnection",
        fields: {
          nodes: { type: "[WpCategory]" },
          pageInfo: { type: "WpWPPageInfo" },
          taxonomyInfo: { type: "WpTaxonomy" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpCategoryToCategoryConnectionEdge",
        fields: { cursor: "String", node: { type: "WpCategory" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpCategoryToPostConnection",
        fields: {
          nodes: { type: "[WpPost]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpCategoryToPostConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPost" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpTag",
        fields: {
          count: "Int",
          databaseId: "Int",
          description: "String",
          id: "ID!",
          link: "String",
          name: "String",
          posts: "WpTagToPostConnection",
          slug: "String",
          taxonomy: { type: "WpTaxonomy" },
          termGroupId: "Int",
          termTaxonomyId: "Int",
          uri: "String",
        },
        extensions: { infer: false },
        interfaces: ["Node"],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpTagToPostConnection",
        fields: {
          nodes: { type: "[WpPost]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpTagToPostConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPost" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostFormat",
        fields: {
          count: "Int",
          databaseId: "Int",
          description: "String",
          id: "ID!",
          link: "String",
          name: "String",
          posts: "WpPostFormatToPostConnection",
          slug: "String",
          taxonomy: { type: "WpTaxonomy" },
          termGroupId: "Int",
          termTaxonomyId: "Int",
          uri: "String",
        },
        extensions: { infer: false },
        interfaces: ["Node"],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostFormatToPostConnection",
        fields: {
          nodes: { type: "[WpPost]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostFormatToPostConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPost" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "INTERFACE",
      config: { name: "WpNodeWithExcerpt", fields: { excerpt: "String" } },
    },
    {
      kind: "INTERFACE",
      config: {
        name: "WpNodeWithTrackbacks",
        fields: {
          pingStatus: "String",
          pinged: { type: "[String]" },
          toPing: { type: "[String]" },
        },
      },
    },
    {
      kind: "INTERFACE",
      config: {
        name: "WpNodeWithRevisions",
        fields: {
          isRevision: "Boolean",
          revisionOf: { type: "WpPostObjectUnion" },
        },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup",
        fields: {
          acfTitle: "String",
          colorPicker: "String",
          fieldGroupName: "String",
          file: { type: "WpMediaItem" },
          flex: { type: "[WpPost_Acfgroup_Flex]" },
          group: { type: "WpPost_Acfgroup_Group" },
          image: { type: "WpMediaItem" },
          inception: { type: "[WpPost_Acfgroup_Inception]" },
          link: { type: "WpACF_Link" },
          relationship: { type: "[WpPostObjectUnion]" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: {
        name: "WpPost_Acfgroup_Flex",
        types: [
          "WpPost_Acfgroup_Flex_Title",
          "WpPost_Acfgroup_Flex_Relationship",
          "WpPost_Acfgroup_Flex_Image",
        ],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup_Flex_Title",
        fields: { fieldGroupName: "String", title: "String" },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup_Flex_Relationship",
        fields: {
          fieldGroupName: "String",
          relationship: { type: "[WpPostObjectUnion]" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup_Flex_Image",
        fields: { fieldGroupName: "String", image: { type: "WpMediaItem" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup_Group",
        fields: {
          fieldGroupName: "String",
          flex: { type: "[WpPost_Acfgroup_Group_Flex]" },
          relationship: { type: "[WpPostObjectUnion]" },
          title: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: {
        name: "WpPost_Acfgroup_Group_Flex",
        types: [
          "WpPost_Acfgroup_Group_Flex_FlexTitle",
          "WpPost_Acfgroup_Group_Flex_FlexRelationship",
          "WpPost_Acfgroup_Group_Flex_FlexFlex",
        ],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup_Group_Flex_FlexTitle",
        fields: { fieldGroupName: "String", title: "String" },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup_Group_Flex_FlexRelationship",
        fields: {
          fieldGroupName: "String",
          relationship: { type: "[WpPostObjectUnion]" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup_Group_Flex_FlexFlex",
        fields: {
          fieldGroupName: "String",
          flex: { type: "[WpPost_Acfgroup_Group_Flex_FlexFlex_Flex]" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: {
        name: "WpPost_Acfgroup_Group_Flex_FlexFlex_Flex",
        types: ["WpPost_Acfgroup_Group_Flex_FlexFlex_Flex_Group"],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup_Group_Flex_FlexFlex_Flex_Group",
        fields: {
          fieldGroupName: "String",
          group: {
            type: "WpPost_Acfgroup_Group_Flex_FlexFlex_Flex_Group_Group",
          },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup_Group_Flex_FlexFlex_Flex_Group_Group",
        fields: { fieldGroupName: "String", title: "String" },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: {
        name: "WpPost_Acfgroup_Inception",
        types: ["WpPost_Acfgroup_Inception_Inception2"],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup_Inception_Inception2",
        fields: {
          fieldGroupName: "String",
          inception2Flex: {
            type: "[WpPost_Acfgroup_Inception_Inception2_Inception2Flex]",
          },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: {
        name: "WpPost_Acfgroup_Inception_Inception2_Inception2Flex",
        types: [
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3",
        ],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3",
        fields: {
          fieldGroupName: "String",
          inception3Flex: {
            type:
              "[WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex]",
          },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: {
        name:
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex",
        types: [
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4",
        ],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name:
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4",
        fields: {
          fieldGroupName: "String",
          inception4Flex: {
            type:
              "[WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4_Inception4Flex]",
          },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: {
        name:
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4_Inception4Flex",
        types: [
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4_Inception4Flex_SimpleTitle",
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4_Inception4Flex_Relationship",
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4_Inception4Flex_Group",
        ],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name:
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4_Inception4Flex_SimpleTitle",
        fields: { fieldGroupName: "String", simpleTitle: "String" },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name:
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4_Inception4Flex_Relationship",
        fields: {
          fieldGroupName: "String",
          relationship: { type: "[WpPostObjectUnion]" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name:
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4_Inception4Flex_Group",
        fields: {
          fieldGroupName: "String",
          group: {
            type:
              "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4_Inception4Flex_Group_Group",
          },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name:
          "WpPost_Acfgroup_Inception_Inception2_Inception2Flex_Inception3_Inception3Flex_Inception4_Inception4Flex_Group_Group",
        fields: {
          fieldGroupName: "String",
          file: { type: "WpMediaItem" },
          image: { type: "WpMediaItem" },
          relationship: { type: "[WpPostObjectUnion]" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpACF_Link",
        fields: { target: "String", title: "String", url: "String" },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostToCategoryConnection",
        fields: {
          nodes: { type: "[WpCategory]" },
          pageInfo: { type: "WpWPPageInfo" },
          taxonomyInfo: { type: "WpTaxonomy" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostToCategoryConnectionEdge",
        fields: { cursor: "String", node: { type: "WpCategory" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostToCommentConnection",
        fields: {
          nodes: { type: "[WpComment]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostToCommentConnectionEdge",
        fields: { cursor: "String", node: { type: "WpComment" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostToPostFormatConnection",
        fields: {
          nodes: { type: "[WpPostFormat]" },
          pageInfo: { type: "WpWPPageInfo" },
          taxonomyInfo: { type: "WpTaxonomy" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostToPostFormatConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPostFormat" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostToPostConnection",
        fields: {
          nodes: { type: "[WpPost]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostToPostConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPost" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostToTagConnection",
        fields: {
          nodes: { type: "[WpTag]" },
          pageInfo: { type: "WpWPPageInfo" },
          taxonomyInfo: { type: "WpTaxonomy" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostToTagConnectionEdge",
        fields: { cursor: "String", node: { type: "WpTag" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPage",
        fields: {
          ancestors: { type: "[WpPostObjectUnion]" },
          author: { type: "WpUser" },
          childPages: "WpPageToPageConnection",
          commentCount: "Int",
          commentStatus: "String",
          comments: "WpPageToCommentConnection",
          content: "String",
          databaseId: "Int!",
          date: "String",
          dateGmt: "String",
          desiredSlug: "String",
          enclosure: "String",
          excerpt: "String",
          featuredImage: { type: "WpMediaItem" },
          guid: "String",
          id: "ID!",
          isFrontPage: "Boolean!",
          isRevision: "Boolean",
          link: "String",
          modified: "String",
          modifiedGmt: "String",
          wpParent: { type: "WpPostObjectUnion" },
          revisionOf: { type: "WpPostObjectUnion" },
          slug: "String",
          status: "String",
          template: { type: "WpContentTemplateUnion" },
          title: "String",
          uri: "String",
          termNames: { type: "[String]" },
          termSlugs: { type: "[String]" },
          terms: { type: "[WpTermObjectUnion]" },
        },
        extensions: { infer: false },
        interfaces: [
          "Node",
          `WpContentNodeInterface`,
          `WpNodeWithTitle`,
          `WpNodeWithContentEditor`,
          `WpNodeWithAuthor`,
          `WpNodeWithFeaturedImage`,
          `WpNodeWithComments`,
          `WpNodeWithRevisions`,
          `WpHierarchicalContentNode`,
        ],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPageToPageConnection",
        fields: {
          nodes: { type: "[WpPage]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPageToPageConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPage" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPageToCommentConnection",
        fields: {
          nodes: { type: "[WpComment]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPageToCommentConnectionEdge",
        fields: { cursor: "String", node: { type: "WpComment" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToMediaItemConnection",
        fields: {
          nodes: { type: "[WpMediaItem]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToMediaItemConnectionEdge",
        fields: { cursor: "String", node: { type: "WpMediaItem" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToPageConnection",
        fields: {
          nodes: { type: "[WpPage]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToPageConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPage" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToPostConnection",
        fields: {
          nodes: { type: "[WpPost]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToPostConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPost" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToContentRevisionUnionConnection",
        fields: {
          nodes: { type: "[WpContentRevisionUnion]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToContentRevisionUnionConnectionEdge",
        fields: { cursor: "String", node: { type: "WpContentRevisionUnion" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: { name: "WpContentRevisionUnion", types: ["WpPost", "WpPage"] },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToUserRoleConnection",
        fields: {
          nodes: { type: "[WpUserRole]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserToUserRoleConnectionEdge",
        fields: { cursor: "String", node: { type: "WpUserRole" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpUserRole",
        fields: {
          capabilities: { type: "[String]" },
          displayName: "String",
          id: "ID!",
          name: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToActionMonitorActionConnection",
        fields: {
          nodes: { type: "[WpActionMonitorAction]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToActionMonitorActionConnectionEdge",
        fields: { cursor: "String", node: { type: "WpActionMonitorAction" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpSettings",
        fields: {
          discussionSettingsDefaultCommentStatus: "String",
          discussionSettingsDefaultPingStatus: "String",
          generalSettingsDateFormat: "String",
          generalSettingsDescription: "String",
          generalSettingsEmail: "String",
          generalSettingsLanguage: "String",
          generalSettingsStartOfWeek: "Int",
          generalSettingsTimeFormat: "String",
          generalSettingsTimezone: "String",
          generalSettingsTitle: "String",
          generalSettingsUrl: "String",
          readingSettingsPostsPerPage: "Int",
          writingSettingsDefaultCategory: "Int",
          writingSettingsDefaultPostFormat: "String",
          writingSettingsUseSmilies: "Boolean",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToCategoryConnection",
        fields: {
          nodes: { type: "[WpCategory]" },
          pageInfo: { type: "WpWPPageInfo" },
          taxonomyInfo: { type: "WpTaxonomy" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToCategoryConnectionEdge",
        fields: { cursor: "String", node: { type: "WpCategory" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToCommentConnection",
        fields: {
          nodes: { type: "[WpComment]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToCommentConnectionEdge",
        fields: { cursor: "String", node: { type: "WpComment" } },
        extensions: { infer: false },
      },
    },
    // {
    //   kind: "OBJECT",
    //   config: {
    //     name: "WpRootQueryToContentNodeConnection",
    //     fields: {
    //       nodes: { type: "[Wpnull]" },
    //       pageInfo: { type: "WpWPPageInfo" },
    //     },
    //     extensions: { infer: false },
    //   },
    // },
    // {
    //   kind: "OBJECT",
    //   config: {
    //     name: "WpRootQueryToContentNodeConnectionEdge",
    //     fields: { cursor: "String", node: { type: "WpContentNode" } },
    //     extensions: { infer: false },
    //   },
    // },
    {
      kind: "OBJECT",
      config: {
        name: "WpDiscussionSettings",
        fields: { defaultCommentStatus: "String", defaultPingStatus: "String" },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpGeneralSettings",
        fields: {
          dateFormat: "String",
          description: "String",
          email: "String",
          language: "String",
          startOfWeek: "Int",
          timeFormat: "String",
          timezone: "String",
          title: "String",
          url: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToMediaItemConnection",
        fields: {
          nodes: { type: "[WpMediaItem]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToMediaItemConnectionEdge",
        fields: { cursor: "String", node: { type: "WpMediaItem" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMenu",
        fields: {
          count: "Int",
          id: "ID!",
          menuId: "Int",
          menuItems: "WpMenuToMenuItemConnection",
          name: "String",
          slug: "String",
        },
        extensions: { infer: false },
        interfaces: ["Node"],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMenuToMenuItemConnection",
        fields: {
          nodes: { type: "[WpMenuItem]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMenuToMenuItemConnectionEdge",
        fields: { cursor: "String", node: { type: "WpMenuItem" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMenuItem",
        fields: {
          childItems: "WpMenuItemToMenuItemConnection",
          connectedObject: { type: "WpMenuItemObjectUnion" },
          cssClasses: { type: "[String]" },
          description: "String",
          id: "ID!",
          label: "String",
          linkRelationship: "String",
          menuItemId: "Int",
          target: "String",
          title: "String",
          url: "String",
        },
        extensions: { infer: false },
        interfaces: ["Node"],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMenuItemToMenuItemConnection",
        fields: {
          nodes: { type: "[WpMenuItem]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpMenuItemToMenuItemConnectionEdge",
        fields: { cursor: "String", node: { type: "WpMenuItem" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "UNION",
      config: {
        name: "WpMenuItemObjectUnion",
        types: [
          "WpPost",
          "WpPage",
          "WpActionMonitorAction",
          "WpCategory",
          "WpTag",
          "WpMenuItem",
        ],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToMenuItemConnection",
        fields: {
          nodes: { type: "[WpMenuItem]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToMenuItemConnectionEdge",
        fields: { cursor: "String", node: { type: "WpMenuItem" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToMenuConnection",
        fields: {
          nodes: { type: "[WpMenu]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToMenuConnectionEdge",
        fields: { cursor: "String", node: { type: "WpMenu" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToPageConnection",
        fields: {
          nodes: { type: "[WpPage]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToPageConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPage" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPlugin",
        fields: {
          author: "String",
          authorUri: "String",
          description: "String",
          id: "ID!",
          name: "String",
          pluginUri: "String",
          version: "String",
        },
        extensions: { infer: false },
        interfaces: ["Node"],
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToPluginConnection",
        fields: {
          nodes: { type: "[WpPlugin]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToPluginConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPlugin" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToPostFormatConnection",
        fields: {
          nodes: { type: "[WpPostFormat]" },
          pageInfo: { type: "WpWPPageInfo" },
          taxonomyInfo: { type: "WpTaxonomy" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToPostFormatConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPostFormat" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostTypeInfo",
        fields: {
          fieldNames: { type: "WpPostTypeInfoGraphQLFieldNames" },
          typeName: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpPostTypeInfoGraphQLFieldNames",
        fields: { plural: "String", singular: "String" },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToPostConnection",
        fields: {
          nodes: { type: "[WpPost]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToPostConnectionEdge",
        fields: { cursor: "String", node: { type: "WpPost" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpReadingSettings",
        fields: { postsPerPage: "Int" },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToContentRevisionUnionConnection",
        fields: {
          nodes: { type: "[WpContentRevisionUnion]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToContentRevisionUnionConnectionEdge",
        fields: { cursor: "String", node: { type: "WpContentRevisionUnion" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToTagConnection",
        fields: {
          nodes: { type: "[WpTag]" },
          pageInfo: { type: "WpWPPageInfo" },
          taxonomyInfo: { type: "WpTaxonomy" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToTagConnectionEdge",
        fields: { cursor: "String", node: { type: "WpTag" } },
        extensions: { infer: false },
      },
    },
    // {
    //   kind: "OBJECT",
    //   config: {
    //     name: "WpRootQueryToTermNodeConnection",
    //     fields: {
    //       nodes: { type: "[Wpnull]" },
    //       pageInfo: { type: "WpWPPageInfo" },
    //     },
    //     extensions: { infer: false },
    //   },
    // },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToTermNodeConnectionEdge",
        fields: { cursor: "String", node: { type: "WpTermNode" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpTheme",
        fields: {
          author: "String",
          authorUri: "String",
          description: "String",
          id: "ID!",
          name: "String",
          screenshot: "String",
          slug: "String",
          tags: { type: "[String]" },
          themeUri: "String",
          version: "Float",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToThemeConnection",
        fields: {
          nodes: { type: "[WpTheme]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToThemeConnectionEdge",
        fields: { cursor: "String", node: { type: "WpTheme" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToUserRoleConnection",
        fields: {
          nodes: { type: "[WpUserRole]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToUserRoleConnectionEdge",
        fields: { cursor: "String", node: { type: "WpUserRole" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToUserConnection",
        fields: {
          nodes: { type: "[WpUser]" },
          pageInfo: { type: "WpWPPageInfo" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootQueryToUserConnectionEdge",
        fields: { cursor: "String", node: { type: "WpUser" } },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpWritingSettings",
        fields: {
          defaultCategory: "Int",
          defaultPostFormat: "String",
          useSmilies: "Boolean",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "WpRootMutation",
        fields: { increaseCount: "Int" },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "Wp__Schema",
        fields: {
          mutationType: { type: "Wp__Type" },
          subscriptionType: { type: "Wp__Type" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "Wp__Type",
        fields: {
          name: "String",
          description: "String",
          ofType: { type: "Wp__Type" },
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "Wp__Field",
        fields: {
          name: "String!",
          description: "String",
          isDeprecated: "Boolean!",
          deprecationReason: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "Wp__InputValue",
        fields: {
          name: "String!",
          description: "String",
          defaultValue: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "Wp__EnumValue",
        fields: {
          name: "String!",
          description: "String",
          isDeprecated: "Boolean!",
          deprecationReason: "String",
        },
        extensions: { infer: false },
      },
    },
    {
      kind: "OBJECT",
      config: {
        name: "Wp__Directive",
        fields: { name: "String!", description: "String" },
        extensions: { infer: false },
      },
    },
  ])
  return
  const state = store.getState()
  const {
    fieldAliases,
    fieldBlacklist,
    introspectionData: { data },
  } = state.introspection

  let typeDefs = []

  const mutationTypes = data.__schema.mutationType.fields.map(
    field => field.type.name
  )

  const gatsbyNodeTypes = getContentTypeQueryInfos().map(
    query => query.typeInfo.nodesTypeName
  )

  data.__schema.types
    .filter(
      type =>
        // remove unneeded types
        type.name !== `RootQuery` &&
        type.kind !== `SCALAR` &&
        type.kind !== `ENUM` &&
        type.kind !== `INPUT_OBJECT` &&
        !mutationTypes.includes(type.name)
    )
    .forEach(type => {
      if (type.kind === `UNION`) {
        typeDefs.push(
          schema.buildUnionType({
            name: `Wp${type.name}`,
            types: type.possibleTypes.map(
              possibleType => `Wp${possibleType.name}`
            ),
            resolveType: node => {
              if (node.type) {
                return `Wp${node.type}`
              }

              if (node.__typename) {
                return `Wp${node.__typename}`
              }

              return null
            },
          })
        )
        return
      }

      const transformedFields = transformFields({
        fields: type.fields,
        gatsbyNodeTypes,
        fieldAliases,
        fieldBlacklist,
      })

      // interfaces dont work properly yet
      if (type.kind === `INTERFACE`) {
        typeDefs.push(
          schema.buildInterfaceType({
            name: `Wp${type.name}`,
            fields: transformedFields,
            resolveType: node => dd(node),
          })
        )

        return
      }

      if (type.kind === `OBJECT`) {
        let objectType = {
          name: `Wp${type.name}`,
          fields: transformedFields,
          extensions: {
            infer: false,
          },
        }

        if (gatsbyNodeTypes.includes(type.name)) {
          objectType.interfaces = [`Node`]
        }

        if (type.name === `MediaItem`) {
          objectType.fields.remoteFile = {
            type: `File`,
            resolve: (mediaItemNode, args, context, info) => {
              if (!mediaItemNode) {
                return null
              }

              if (
                !mediaItemNode.remoteFile &&
                !getPluginOptions().type.MediaItem.onlyFetchIfReferenced
              ) {
                // @todo think of a better way to fetch images
                // this isn't such a good way to do it.
                // query running prevents us from downloading a bunch of images in parallell
                // and this also messes up the cli output.
                // for now MediaItem.onlyFetchIfReferenced = true is the recommended way to get media files as that option downloads referenced images upfront
                // where this option fetches images as they're queried for
                // @todo create a clearer plugin option (MediaItem.fetchOnQuery?)
                return createRemoteMediaItemNode({
                  mediaItemNode,
                })
              }

              if (!mediaItemNode.remoteFile) {
                return null
              }

              const node = context.nodeModel.getNodeById({
                id: mediaItemNode.remoteFile.id,
                type: `File`,
              })

              return node
            },
          }
        }

        typeDefs.push(schema.buildObjectType(objectType))

        return
      }
    })

  await clipboardy.write(JSON.stringify(typeDefs))

  dd()

  actions.createTypes(typeDefs)
}
