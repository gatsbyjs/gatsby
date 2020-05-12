import recursivelyTransformFields from "./recursively-transform-fields"
import {
  buildNodesQueryOnFieldName,
  buildNodeQueryOnFieldName,
  buildSelectionSet,
  buildReusableFragments,
} from "./build-query-on-field-name"

import store from "~/store"
import { getTypeSettingsByType } from "~/steps/create-schema-customization/helpers"
import gqlPrettier from "graphql-prettier"
import { formatLogMessage } from "~/utils/format-log-message"

const recursivelyAliasFragments = field =>
  field.inlineFragments.map(fragment => {
    // for each of this inlineFragments fields
    fragment.fields = fragment.fields.map(fragmentField => {
      if (typeof fragmentField === `string`) {
        return fragmentField
      }

      // compare it against each field of each other fragment
      let updatedFragmentField = fragmentField

      field.inlineFragments.forEach(possiblyConflictingFragment => {
        // don't compare this fragment against itself
        if (possiblyConflictingFragment.name === fragment.name) {
          return
        }

        possiblyConflictingFragment.fields.forEach(possiblyConflictingField => {
          const fieldNamesMatch =
            fragmentField.fieldName === possiblyConflictingField.fieldName

          const fieldTypeKindsDontMatch =
            possiblyConflictingField?.fieldType?.kind !==
            fragmentField?.fieldType?.kind

          const fieldTypeNamesDontMatch =
            possiblyConflictingField?.fieldType?.name !==
            fragmentField?.fieldType?.name

          // if the fields have the same name but a different type kind
          // alias them
          if (
            fieldNamesMatch &&
            (fieldTypeKindsDontMatch || fieldTypeNamesDontMatch)
          ) {
            const autoAliasedFieldName = `${fragmentField.fieldName}__typename_${fragmentField.fieldType.name}: ${fragmentField.fieldName}`

            updatedFragmentField = {
              ...fragmentField,
              fieldName: autoAliasedFieldName,
            }

            return
          }
        })
      })
      // if the fields have the same name but a different type AND the field has sub fields, compare those sub fields against any fragment fields subfields where the field name matches
      // if any subfields have conflicting types, alias them

      if (updatedFragmentField.inlineFragments) {
        updatedFragmentField.inlineFragments = recursivelyAliasFragments(
          updatedFragmentField
        )
      }

      return updatedFragmentField
    })

    return fragment
  })

const aliasConflictingFieldFields = field => {
  // we only have conflicting fields in inlineFragments
  // if there are no inlineFragments, do nothing
  if (!field.inlineFragments) {
    return field
  }

  field.inlineFragments = recursivelyAliasFragments(field)

  if (field.fields) {
    field.fields = aliasConflictingFields({
      transformedFields: field.fields,
    })
  }

  return field
}

const aliasConflictingFields = ({ transformedFields }) =>
  transformedFields.map(aliasConflictingFieldFields)

const aliasConflictingFragmentFields = ({ fragments }) => {
  for (const [fragmentKey, fragment] of Object.entries(fragments)) {
    const aliasedFragment = aliasConflictingFieldFields(fragment)

    fragments[fragmentKey] = aliasedFragment
  }
}

const timeFunction = async ({ label, fn, args = {}, disableTimer = false }) => {
  const {
    gatsbyApi: {
      helpers: { reporter },
    },
  } = store.getState()

  const activity = reporter.activityTimer(label)

  if (!disableTimer) {
    activity.start()
  }

  const result = await fn(args)

  if (!disableTimer) {
    activity.end()
  }

  return result
}

/**
 * generateNodeQueriesFromIngestibleFields
 *
 * Takes in data from an introspection query and
 * processes it to build GraphQL query strings/info
 *
 * @param {object} introspectionData
 * @returns {Object} GraphQL query info including gql query strings
 */
const generateNodeQueriesFromIngestibleFields = async () => {
  const {
    remoteSchema,
    gatsbyApi: {
      helpers: { reporter },
      pluginOptions: {
        debug: {
          graphql: { copyNodeSourcingQueryAndExit },
        },
      },
    },
  } = store.getState()

  const {
    fieldBlacklist,
    nodeListFilter,
    typeMap,
    ingestibles: { nodeListRootFields },
  } = remoteSchema

  const rootFields = typeMap.get(`RootQuery`).fields

  let nodeQueries = {}

  for (const { type, name, args } of nodeListRootFields) {
    if (fieldBlacklist.includes(name)) {
      continue
    }

    // nested fields
    const fieldFields = typeMap.get(type.name).fields

    // a nested field containing a list of nodes
    const nodesField = fieldFields.find(nodeListFilter)

    // the type of this query
    const nodesType = typeMap.get(nodesField.type.ofType.name)

    const { fields } = nodesType

    const settings = getTypeSettingsByType(nodesType)

    if (settings.exclude) {
      continue
    }

    let nodeListQueries = []

    const singleNodeRootFieldInfo = rootFields.find(
      field => field.type.name === nodesType.name
    )

    if (!singleNodeRootFieldInfo) {
      // @todo handle cases where there is a nodelist field but no individual field. we can't do data updates or preview on this type.
      reporter.info(
        formatLogMessage(
          `${nodesType.name} Unable to find a root field to query single nodes of this type`
        )
      )
      continue
    }

    const generateNodeQueriesActivity = reporter.activityTimer(
      `generate node queries for ${name}`
    )
    generateNodeQueriesActivity.start()

    const fragments = {}

    const singleFieldName = singleNodeRootFieldInfo?.name

    const prepareFieldsActivity = reporter.activityTimer(
      `${singleFieldName} Prepare fields`
    )
    prepareFieldsActivity.start()
    const transformedFields = recursivelyTransformFields({
      fields,
      fragments,
      parentType: type,
    })
    prepareFieldsActivity.end()

    // mutates the fragments..
    aliasConflictingFragmentFields({ fragments })

    const aliasFieldsActivity = reporter.activityTimer(
      `${singleFieldName} alias conflicting fields`
    )
    aliasFieldsActivity.start()
    const aliasedTransformedFields = aliasConflictingFields({
      transformedFields,
      parentType: type,
    })
    aliasFieldsActivity.end()

    const builtFragments = buildReusableFragments({ fragments })

    const buildSelectionSetActivity = reporter.activityTimer(
      `${singleFieldName} build selection set string`
    )
    buildSelectionSetActivity.start()
    const selectionSet = buildSelectionSet(aliasedTransformedFields, {
      fieldPath: name,
      fragments,
    })

    buildSelectionSetActivity.end()

    const buildNodeQueryActivity = reporter.activityTimer(
      `${singleFieldName} build node query`
    )
    buildNodeQueryActivity.start()

    const nodeQuery = buildNodeQueryOnFieldName({
      fields: transformedFields,
      fieldName: singleFieldName,
      settings,
      builtFragments,
      builtSelectionSet: selectionSet,
    })

    buildNodeQueryActivity.end()

    const buildPreviewQueryActivity = reporter.activityTimer(
      `${singleFieldName} build node preview query`
    )
    buildPreviewQueryActivity.start()
    const previewQuery = buildNodeQueryOnFieldName({
      fields: transformedFields,
      fieldName: singleFieldName,
      fieldInputArguments: `id: $id, idType: DATABASE_ID`,
      queryName: `PREVIEW_QUERY`,
      settings,
      builtFragments,
      builtSelectionSet: selectionSet,
    })
    buildPreviewQueryActivity.end()

    const whereArgs = args.find(arg => arg.name === `where`)

    const needsNullParent = whereArgs
      ? !!whereArgs.type.inputFields.find(
          inputField => inputField.name === `parent`
        )
      : false

    const fieldVariables = needsNullParent
      ? `where: { parent: null ${settings.where || ``} }`
      : settings.where || ``

    if (
      settings.nodeListQueries &&
      typeof settings.nodeListQueries === `function`
    ) {
      const queries = settings.nodeListQueries({
        name,
        fields,
        selectionSet,
        builtFragments,
        singleFieldName,
        singleNodeRootFieldInfo,
        settings,
        store,
        fieldVariables,
        remoteSchema,
        transformedFields,
        helpers: {
          recursivelyTransformFields,
          buildNodesQueryOnFieldName,
        },
      })

      if (queries && queries.length) {
        nodeListQueries = queries
      }
    }

    if (!nodeListQueries || !nodeListQueries.length) {
      const nodeListQueryActivity = reporter.activityTimer(
        `${singleFieldName} build node list query`
      )
      nodeListQueryActivity.start()
      const nodeListQuery = buildNodesQueryOnFieldName({
        fields: transformedFields,
        fieldName: name,
        fieldVariables,
        settings,
        builtFragments,
        builtSelectionSet: selectionSet,
      })
      nodeListQueryActivity.end()

      nodeListQueries = [nodeListQuery]
    }

    if (
      process.env.NODE_ENV === `development` &&
      nodesType.name === copyNodeSourcingQueryAndExit
    ) {
      try {
        reporter.log(``)
        reporter.warn(
          formatLogMessage(
            `Query debug mode. Writing node list query for the ${nodesType.name} node type to the system clipboard and exiting\n\n`
          )
        )
        await clipboardy.write(gqlPrettier(nodeListQueries[0]))
        process.exit()
      } catch (e) {
        reporter.log(``)
        reporter.error(e)
        reporter.log(``)
        reporter.warn(
          formatLogMessage(
            `Query debug mode failed. There was a failed attempt to copy the query for the ${nodesType.name} node type to your clipboard.\n\n`
          )
        )
        reporter.error(e)
      }
    }

    // build a query info object containing gql query strings for fetching
    // node lists or single nodes, as well as type info and plugin
    // settings for this type
    nodeQueries[name] = {
      typeInfo: {
        singularName: singleFieldName,
        pluralName: name,
        nodesTypeName: nodesType.name,
      },
      nodeListQueries,
      nodeQuery,
      previewQuery,
      selectionSet,
      builtFragments,
      settings,
    }

    generateNodeQueriesActivity.end()
  }

  return nodeQueries
}

export default generateNodeQueriesFromIngestibleFields
