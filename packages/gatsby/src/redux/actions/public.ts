import Joi from "@hapi/joi"
import chalk from "chalk"
import _ from "lodash"
import { stripIndent } from "common-tags"
import report from "gatsby-cli/lib/reporter"
import { platform } from "os"
import path from "path"
import { readFileSync } from "fs"
import { trueCasePathSync } from "true-case-path"
import url from "url"
import { slash } from "gatsby-core-utils"
import { hasNodeChanged, getNode } from "../../db/nodes"
import sanitizeNode from "../../db/sanitize-node"
import { store } from ".."
import * as fsExists from "fs-exists-cached"
import { generateComponentChunkName } from "../../utils/js-chunk-names"
import { nodeSchema } from "../../joi-schemas/joi"
import {
  getCommonDir,
  truncatePath,
  tooLongSegmentsInPath,
} from "../../utils/path"
import apiRunnerNode from "../../utils/api-runner-node"
import { trackCli } from "gatsby-telemetry"
import { getNonGatsbyCodeFrame } from "../../utils/stack-trace-utils"
import {
  IGatsbyPlugin,
  IPageInput,
  IGatsbyPage,
  IJobV2,
  IPageDataRemove,
  IPageData,
  IGatsbyError,
  IActionOptions,
  ICreatePageAction,
  IDeletePageAction,
  IDeleteNodeAction,
  IDeleteNodesAction,
  ICreateNodeAction,
  IValidationErrorAction,
  ITouchNodeAction,
  ICreateNodeFieldAction,
  ICreateParentChildLinkAction,
  ISetWebpackConfigAction,
  IReplaceWebpackConfigAction,
  ISetBabelOptionsAction,
  ISetBabelPluginAction,
  ISetBabelPresetAction,
  ICreateJobAction,
  ICreateJobV2Action,
  ISetJobAction,
  IEndJobAction,
  ISetPluginStatusAction,
  ICreateRedirectAction,
  ICreatePageDependencyAction,
  ISetPageDataAction,
  IRemovePageDataAction,
  IGatsbyNode,
  BabelStageKeys,
  IGatsbyIncompleteJob,
  Optional,
} from "../types"
import webpack from "webpack"

/**
 * Memoize function used to pick shadowed page components to avoid expensive I/O.
 * Ideally, we should invalidate memoized values if there are any FS operations
 * on files that are in shadowing chain, but webpack currently doesn't handle
 * shadowing changes during develop session, so no invalidation is not a deal breaker.
 */
const shadowCreatePagePath = _.memoize(
  require(`../../internal-plugins/webpack-theme-component-shadowing/create-page`)
)
const {
  enqueueJob,
  createInternalJob,
  removeInProgressJob,
  getInProcessJobPromise,
} = require(`../../utils/jobs-manager`)

const isWindows = platform() === `win32`

const ensureWindowsDriveIsUppercase = (filePath: string): string => {
  const segments = filePath.split(`:`).filter(s => s !== ``)
  return segments.length > 0
    ? segments.shift()!.toUpperCase() + `:` + segments.join(`:`)
    : filePath
}

const findChildren = (
  initialChildren: IGatsbyNode["id"][]
): IGatsbyNode["id"][] => {
  const children = [...initialChildren]
  const queue = [...initialChildren]
  const traversedNodes = new Set()

  while (queue.length > 0) {
    const currentChild = getNode(queue.pop())
    if (!currentChild || traversedNodes.has(currentChild.id)) {
      continue
    }
    traversedNodes.add(currentChild.id)
    const newChildren = currentChild.children
    if (_.isArray(newChildren) && newChildren.length > 0) {
      children.push(...newChildren)
      queue.push(...newChildren)
    }
  }
  return children
}

/**
 * Delete a page
 */
export const deletePage = (
  page: Omit<IPageInput, "component">
): IDeletePageAction => {
  return {
    type: `DELETE_PAGE`,
    payload: page,
  }
}

const pascalCase = _.flow(_.camelCase, _.upperFirst)
const hasWarnedForPageComponentInvalidContext = new Set()
const hasWarnedForPageComponentInvalidCasing = new Set()
const hasErroredBecauseOfNodeValidation = new Set()
const pageComponentCache = {}
const fileOkCache = {}

/**
 * Create a page. See [the guide on creating and modifying pages](/docs/creating-and-modifying-pages/)
 * for detailed documentation about creating pages.
 */
export const createPage = (
  page: IPageInput,
  plugin?: Optional<IGatsbyPlugin, "id" | "version">,
  actionOptions?: IActionOptions
): ICreatePageAction | string => {
  const pluginPlaceholder = `Your site's "gatsby-node.js"`
  const hasNoPluginName = !plugin || plugin.name === `default-site-plugin`
  const name = `The plugin "${
    hasNoPluginName ? pluginPlaceholder : plugin!.name
  }"`
  if (!page.path) {
    const message = `${name} must set the page path when creating a page`
    // Don't log out when testing
    if (process.env.NODE_ENV !== `test`) {
      report.panic({
        id: `11323`,
        context: {
          pluginName: name,
          pageObject: page,
          message,
        },
      })
    } else {
      return message
    }
  }

  // Validate that the context object doesn't overlap with any core page fields
  // as this will cause trouble when running graphql queries.
  if (_.isObject(page.context)) {
    const reservedFields = [
      `path`,
      `matchPath`,
      `component`,
      `componentChunkName`,
      `pluginCreator___NODE`,
      `pluginCreatorId`,
    ]
    const invalidFields = Object.keys(_.pick(page.context, reservedFields))

    const singularMessage = `${name} used a reserved field name in the context object when creating a page:`
    const pluralMessage = `${name} used reserved field names in the context object when creating a page:`
    if (invalidFields.length > 0) {
      const error = `${
        invalidFields.length === 1 ? singularMessage : pluralMessage
      }

${invalidFields.map(f => `  * "${f}"`).join(`\n`)}

${JSON.stringify(page, null, 4)}

Data in "context" is passed to GraphQL as potential arguments when running the
page query.

When arguments for GraphQL are constructed, the context object is combined with
the page object so *both* page object and context data are available as
arguments. So you don't need to add the page "path" to the context as it's
already available in GraphQL. If a context field duplicates a field already
used by the page object, this can break functionality within Gatsby so must be
avoided.

Please choose another name for the conflicting fields.

The following fields are used by the page object and should be avoided.

${reservedFields.map(f => `  * "${f}"`).join(`\n`)}

            `
      if (process.env.NODE_ENV === `test`) {
        return error
        // Only error if the context version is different than the page
        // version.  People in v1 often thought that they needed to also pass
        // the path to context for it to be available in GraphQL
      } else if (invalidFields.some(f => page.context![f] !== page[f])) {
        report.panic({
          id: `11324`,
          context: {
            message: error,
          },
        })
      } else {
        if (!hasWarnedForPageComponentInvalidContext.has(page.component)) {
          report.warn(error)
          hasWarnedForPageComponentInvalidContext.add(page.component)
        }
      }
    }
  }

  // Check if a component is set.
  if (!page.component) {
    if (process.env.NODE_ENV !== `test`) {
      report.panic({
        id: `11322`,
        context: {
          pluginName: name,
          pageObject: page,
        },
      })
    } else {
      // For test
      return `A component must be set when creating a page`
    }
  }

  const pageComponentPath = shadowCreatePagePath(page.component)
  if (pageComponentPath) {
    page.component = pageComponentPath
  }

  // Don't check if the component exists during tests as we use a lot of fake
  // component paths.
  if (process.env.NODE_ENV !== `test`) {
    if (!fsExists.sync(page.component)) {
      report.panic({
        id: `11325`,
        context: {
          pluginName: name,
          pageObject: page,
          component: page.component,
        },
      })
    }
  }
  if (!path.isAbsolute(page.component)) {
    // Don't log out when testing
    if (process.env.NODE_ENV !== `test`) {
      report.panic({
        id: `11326`,
        context: {
          pluginName: name,
          pageObject: page,
          component: page.component,
        },
      })
    } else {
      const message = `${name} must set the absolute path to the page component when create creating a page`
      return message
    }
  }

  // check if we've processed this component path
  // before, before running the expensive "trueCasePath"
  // operation
  //
  // Skip during testing as the paths don't exist on disk.
  if (process.env.NODE_ENV !== `test`) {
    if (pageComponentCache[page.component]) {
      page.component = pageComponentCache[page.component]
    } else {
      const originalPageComponent = page.component

      // normalize component path
      page.component = slash(page.component)
      // check if path uses correct casing - incorrect casing will
      // cause issues in query compiler and inconsistencies when
      // developing on Mac or Windows and trying to deploy from
      // linux CI/CD pipeline
      let trueComponentPath
      try {
        // most systems
        trueComponentPath = slash(trueCasePathSync(page.component))
      } catch (e) {
        // systems where user doesn't have access to /
        const commonDir = getCommonDir(
          store.getState().program.directory,
          page.component
        )

        // using `path.win32` to force case insensitive relative path
        const relativePath = slash(
          path.win32.relative(commonDir, page.component)
        )

        trueComponentPath = slash(trueCasePathSync(relativePath, commonDir))
      }

      if (isWindows) {
        page.component = ensureWindowsDriveIsUppercase(page.component)
      }

      if (trueComponentPath !== page.component) {
        if (!hasWarnedForPageComponentInvalidCasing.has(page.component)) {
          const markers = page.component
            .split(``)
            .map((letter, index) => {
              if (letter !== trueComponentPath[index]) {
                return `^`
              }
              return ` `
            })
            .join(``)

          report.warn(
            stripIndent`
          ${name} created a page with a component path that doesn't match the casing of the actual file. This may work locally, but will break on systems which are case-sensitive, e.g. most CI/CD pipelines.

          page.component:     "${page.component}"
          path in filesystem: "${trueComponentPath}"
                               ${markers}
        `
          )
          hasWarnedForPageComponentInvalidCasing.add(page.component)
        }

        page.component = trueComponentPath
      }

      pageComponentCache[originalPageComponent] = page.component
    }
  }

  let internalComponentName
  if (page.path === `/`) {
    internalComponentName = `ComponentIndex`
  } else {
    internalComponentName = `Component${pascalCase(page.path)}`
  }

  const invalidPathSegments = tooLongSegmentsInPath(page.path)

  if (invalidPathSegments.length > 0) {
    const truncatedPath = truncatePath(page.path)
    report.panicOnBuild({
      id: `11331`,
      context: {
        path: page.path,
        invalidPathSegments,

        // we will only show truncatedPath in non-production scenario
        isProduction: process.env.NODE_ENV === `production`,
        truncatedPath,
      },
    })
    page.path = truncatedPath
  }

  const internalPage: IGatsbyPage = {
    internalComponentName,
    path: page.path,
    matchPath: page.matchPath,
    component: page.component,
    componentChunkName: generateComponentChunkName(page.component),
    isCreatedByStatefulCreatePages:
      actionOptions?.traceId === `initial-createPagesStatefully`,
    // Ensure the page has a context object
    context: page.context || {},
    updatedAt: Date.now(),
  }

  // If the path doesn't have an initial forward slash, add it.
  if (internalPage.path[0] !== `/`) {
    internalPage.path = `/${internalPage.path}`
  }

  // Validate that the page component imports React and exports something
  // (hopefully a component).
  //
  // Only run validation once during builds.
  if (
    !internalPage.component.includes(`/.cache/`) &&
    process.env.NODE_ENV === `production` &&
    !fileOkCache[internalPage.component]
  ) {
    const fileName = internalPage.component
    const fileContent = readFileSync(fileName, `utf-8`)
    let notEmpty = true
    let includesDefaultExport = true

    if (fileContent === ``) {
      notEmpty = false
    }

    if (
      !fileContent.includes(`export default`) &&
      !fileContent.includes(`module.exports`) &&
      !fileContent.includes(`exports.default`) &&
      !fileContent.includes(`exports["default"]`) &&
      !fileContent.match(/export \{.* as default.*\}/s) &&
      // this check only applies to js and ts, not mdx
      /\.(jsx?|tsx?)/.test(path.extname(fileName))
    ) {
      includesDefaultExport = false
    }
    if (!notEmpty || !includesDefaultExport) {
      const relativePath = path.relative(
        store.getState().program.directory,
        fileName
      )

      if (!notEmpty) {
        report.panicOnBuild({
          id: `11327`,
          context: {
            relativePath,
          },
        })
      }

      if (!includesDefaultExport) {
        report.panicOnBuild({
          id: `11328`,
          context: {
            fileName,
          },
        })
      }
    }

    fileOkCache[internalPage.component] = true
  }

  const oldPage = store.getState().pages.get(internalPage.path)
  const contextModified =
    !!oldPage && !_.isEqual(oldPage.context, internalPage.context)

  const alternateSlashPath = page.path.endsWith(`/`)
    ? page.path.slice(0, -1)
    : page.path + `/`

  if (store.getState().pages.has(alternateSlashPath)) {
    report.warn(
      chalk.bold.yellow(`Non-deterministic routing danger: `) +
        `Attempting to create page: "${page.path}", but page "${alternateSlashPath}" already exists\n` +
        chalk.bold.yellow(
          `This could lead to non-deterministic routing behavior`
        )
    )
  }

  return {
    ...actionOptions,
    type: `CREATE_PAGE`,
    contextModified,
    plugin,
    payload: internalPage,
  }
}

/**
 * Delete a node
 */
export const deleteNode = (
  options: IGatsbyNode["id"] | { node: IGatsbyNode },
  plugin: IGatsbyPlugin,
  args: IGatsbyPlugin
): IDeleteNodeAction | IDeleteNodeAction[] => {
  let id

  // Check if using old method signature. Warn about incorrect usage but get
  // node from nodeID anyway.
  if (typeof options === `string`) {
    let msg =
      `Calling "deleteNode" with a nodeId is deprecated. Please pass an ` +
      `object containing a full node instead: deleteNode({ node }).`
    if (args && args.name) {
      // `plugin` used to be the third argument
      plugin = args
      msg = msg + ` "deleteNode" was called by ${plugin.name}`
    }
    report.warn(msg)

    id = options
  } else {
    id = options && options.node && options.node.id
  }

  // Always get node from the store, as the node we get as an arg
  // might already have been deleted.
  const node = getNode(id) as IGatsbyNode
  if (plugin) {
    const pluginName = plugin.name

    /* eslint-disable @typescript-eslint/no-use-before-define */
    if (node && typeOwners[node.internal.type] !== pluginName)
      throw new Error(stripIndent`
          The plugin "${pluginName}" deleted a node of a type owned by another plugin.

          The node type "${node.internal.type}" is owned by "${
        typeOwners[node.internal.type]
      }".

          The node object passed to "deleteNode":

          ${JSON.stringify(node, null, 4)}

          The plugin deleting the node:

          ${JSON.stringify(plugin, null, 4)}
        `)
    /* eslint-enable @typescript-eslint/no-use-before-define */
  }

  const createDeleteAction = (node: IGatsbyNode): IDeleteNodeAction => {
    return {
      type: `DELETE_NODE`,
      plugin,
      payload: node,
    }
  }

  const deleteAction = createDeleteAction(node)

  // It's possible the file node was never created as sometimes tools will
  // write and then immediately delete temporary files to the file system.
  const deleteDescendantsActions =
    node &&
    findChildren(node.children)
      .map<IGatsbyNode>(getNode)
      .map(createDeleteAction)

  if (deleteDescendantsActions && deleteDescendantsActions.length) {
    return [...deleteDescendantsActions, deleteAction]
  } else {
    return deleteAction
  }
}

/**
 * Batch delete nodes
 */
export const deleteNodes = (
  nodes: string[],
  plugin: IGatsbyPlugin
): IDeleteNodesAction => {
  let msg =
    `The "deleteNodes" action is now deprecated and will be removed in ` +
    `Gatsby v3. Please use "deleteNode" instead.`
  if (plugin && plugin.name) {
    msg = msg + ` "deleteNodes" was called by ${plugin.name}`
  }
  report.warn(msg)

  // Also delete any nodes transformed from these.
  const descendantNodes = _.flatten(
    nodes.map(n => findChildren(getNode(n).children))
  )

  const nodeIds = [...nodes, ...descendantNodes]

  return {
    type: `DELETE_NODES`,
    plugin,
    // Payload contains node IDs but inference-metadata requires full node instances
    payload: nodeIds,
    fullNodes: nodeIds.map(getNode) as IGatsbyNode[],
  }
}

// We add a counter to internal to make sure we maintain insertion order for
// backends that don't do that out of the box
let NODE_COUNTER = 0

const typeOwners = {}

/**
 * Create a new node.
 */
type CreateNode = (
  node: IGatsbyNode,
  plugin?: Optional<IGatsbyPlugin, "id" | "version">,
  actionOptions?: IActionOptions
) =>
  | ICreateNodeAction
  | ITouchNodeAction
  | IValidationErrorAction
  | (ICreateNodeAction | IDeleteNodeAction)[]
  | void

const _createNode: CreateNode = (node, plugin, actionOptions) => {
  if (typeof node !== `object`) {
    return console.log(
      chalk.bold.red(
        `The node passed to the "createNode" action creator must be an object`
      )
    )
  }

  // Ensure the new node has an internals object.
  if (!node.internal) {
    node.internal = {} as IGatsbyNode["internal"]
  }

  NODE_COUNTER++
  node.internal.counter = NODE_COUNTER

  // Ensure the new node has a children array.
  if (!node.array && !_.isArray(node.children)) {
    node.children = []
  }

  // Ensure the new node has a parent field
  if (!node.parent) {
    node.parent = null
  }

  // Tell user not to set the owner name themself.
  if (node.internal.owner) {
    report.error(JSON.stringify(node, null, 4))
    report.panic(
      chalk.bold.red(
        `The node internal.owner field is set automatically by Gatsby and not by plugins`
      )
    )
  }

  const trackParams = {}
  // Add the plugin name to the internal object.
  if (plugin) {
    node.internal.owner = plugin.name
    trackParams[`pluginName`] = `${plugin.name}@${plugin.version}`
  }

  trackCli(`CREATE_NODE`, trackParams, { debounce: true })

  const result = (Joi as any).validate(node, nodeSchema)
  if (result.error) {
    if (!hasErroredBecauseOfNodeValidation.has(result.error.message)) {
      const errorObj: IGatsbyError = {
        id: `11467`,
        context: {
          validationErrorMessage: result.error.message,
          node,
        },
      }

      const possiblyCodeFrame = getNonGatsbyCodeFrame()
      if (possiblyCodeFrame) {
        errorObj.context.codeFrame = possiblyCodeFrame.codeFrame
        errorObj.filePath = possiblyCodeFrame.fileName
        errorObj.location = {
          start: {
            line: possiblyCodeFrame.line,
            column: possiblyCodeFrame.column,
          },
        }
      }

      report.error(errorObj)
      hasErroredBecauseOfNodeValidation.add(result.error.message)
    }

    return { type: `VALIDATION_ERROR`, error: true }
  }

  // Ensure node isn't directly setting fields.
  if (node.fields) {
    throw new Error(
      stripIndent`
      Plugins creating nodes can not set data on the reserved field "fields"
      as this is reserved for plugins which wish to extend your nodes.

      If your plugin didn't add "fields" you're probably seeing this
      error because you're reusing an old node object.

      Node:

      ${JSON.stringify(node, null, 4)}

      Plugin that created the node:

      ${JSON.stringify(plugin, null, 4)}
    `
    )
  }

  node = sanitizeNode(node)

  const oldNode = getNode(node.id) as IGatsbyNode

  // Ensure the plugin isn't creating a node type owned by another
  // plugin. Type "ownership" is first come first served.
  if (plugin) {
    const pluginName = plugin.name

    if (!typeOwners[node.internal.type])
      typeOwners[node.internal.type] = pluginName
    else if (typeOwners[node.internal.type] !== pluginName)
      throw new Error(stripIndent`
        The plugin "${pluginName}" created a node of a type owned by another plugin.

        The node type "${node.internal.type}" is owned by "${
        typeOwners[node.internal.type]
      }".

        If you copy and pasted code from elsewhere, you'll need to pick a new type name
        for your new node(s).

        The node object passed to "createNode":

        ${JSON.stringify(node, null, 4)}

        The plugin creating the node:

        ${JSON.stringify(plugin, null, 4)}
      `)

    // If the node has been created in the past, check that
    // the current plugin is the same as the previous.
    if (oldNode && oldNode.internal.owner !== pluginName) {
      throw new Error(
        stripIndent`
        Nodes can only be updated by their owner. Node "${node.id}" is
        owned by "${oldNode.internal.owner}" and another plugin "${pluginName}"
        tried to update it.

        `
      )
    }
  }

  actionOptions = actionOptions || {}

  if (actionOptions.parentSpan) {
    actionOptions.parentSpan.setTag(`nodeId`, node.id)
    actionOptions.parentSpan.setTag(`nodeType`, node.id)
  }

  let deleteActions
  let updateNodeAction: ICreateNodeAction | ITouchNodeAction
  // Check if the node has already been processed.
  if (oldNode && !hasNodeChanged(node.id, node.internal.contentDigest)) {
    updateNodeAction = {
      ...actionOptions,
      plugin,
      type: `TOUCH_NODE`,
      payload: node.id,
    }
  } else {
    // Remove any previously created descendant nodes as they're all due
    // to be recreated.
    if (oldNode) {
      const createDeleteAction = (node): IDeleteNodeAction => {
        return {
          ...actionOptions,
          type: `DELETE_NODE`,
          plugin,
          payload: node,
        }
      }
      deleteActions = findChildren(oldNode.children)
        .map(getNode)
        .map(createDeleteAction)
    }

    updateNodeAction = {
      ...actionOptions,
      type: `CREATE_NODE`,
      plugin,
      oldNode,
      payload: node,
    }
  }

  if (deleteActions && deleteActions.length) {
    return [...deleteActions, updateNodeAction]
  } else {
    return updateNodeAction
  }
}

export const createNode = (...args: Parameters<CreateNode>) => (
  dispatch
): Promise<any> | undefined => {
  const actions = _createNode(...args) as (
    | ICreateNodeAction
    | IDeleteNodeAction
    | ITouchNodeAction
  )[]

  dispatch(actions)
  const createNodeAction = (Array.isArray(actions) ? actions : [actions]).find(
    action => action.type === `CREATE_NODE`
  ) as ICreateNodeAction | undefined

  if (!createNodeAction) {
    return undefined
  }

  const { payload: node, traceId, parentSpan } = createNodeAction
  return apiRunnerNode(`onCreateNode`, {
    node,
    traceId,
    parentSpan,
    traceTags: { nodeId: node.id, nodeType: node.internal.type },
  })
}

/**
 * "Touch" a node. Tells Gatsby a node still exists and shouldn't
 * be garbage collected. Primarily useful for source plugins fetching
 * nodes from a remote system that can return only nodes that have
 * updated. The source plugin then touches all the nodes that haven't
 * updated but still exist so Gatsby knows to keep them.
 */
export const touchNode = (
  options: string | { nodeId: IGatsbyNode["id"] },
  plugin?: IGatsbyPlugin
): ITouchNodeAction => {
  let nodeId = _.get(options, `nodeId`)

  // Check if using old method signature. Warn about incorrect usage
  if (typeof options === `string`) {
    console.warn(
      `Calling "touchNode" with a nodeId is deprecated. Please pass an object containing a nodeId instead: touchNode({ nodeId: 'a-node-id' })`
    )

    if (plugin && plugin.name) {
      console.log(`"touchNode" was called by ${plugin.name}`)
    }

    nodeId = options
  }

  const node = getNode(nodeId) as IGatsbyNode
  if (node && !typeOwners[node.internal.type]) {
    typeOwners[node.internal.type] = node.internal.owner
  }

  return {
    type: `TOUCH_NODE`,
    plugin,
    payload: nodeId,
  }
}

interface ICreateNodeInput {
  node: IGatsbyNode
  fieldName?: string
  fieldValue?: string
  name?: string
  value: any
}

/**
 * Extend another node. The new node field is placed under the `fields`
 * key on the extended node object.
 *
 * Once a plugin has claimed a field name the field name can't be used by
 * other plugins.  Also since nodes are immutable, you can't mutate the node
 * directly. So to extend another node, use this.
 */
export const createNodeField = (
  { node, name, value, fieldName, fieldValue }: ICreateNodeInput,
  plugin: Optional<IGatsbyPlugin, "id" | "version">,
  actionOptions?: IActionOptions
): ICreateNodeFieldAction => {
  if (fieldName) {
    console.warn(
      `Calling "createNodeField" with "fieldName" is deprecated. Use "name" instead`
    )
    if (!name) {
      name = fieldName
    }
  }
  if (fieldValue) {
    console.warn(
      `Calling "createNodeField" with "fieldValue" is deprecated. Use "value" instead`
    )
    if (!value) {
      value = fieldValue
    }
  }
  // Ensure required fields are set.
  if (!node.internal.fieldOwners) {
    node.internal.fieldOwners = {}
  }
  if (!node.fields) {
    node.fields = {}
  }

  name = name || ``

  // Normalized name of the field that will be used in schema
  const schemaFieldName = _.includes(name, `___NODE`)
    ? name.split(`___`)[0]
    : name

  // Check that this field isn't owned by another plugin.
  const fieldOwner = node.internal.fieldOwners[schemaFieldName]
  if (fieldOwner && fieldOwner !== plugin.name) {
    throw new Error(
      stripIndent`
      A plugin tried to update a node field that it doesn't own:

      Node id: ${node.id}
      Plugin: ${plugin.name}
      name: ${name}
      value: ${value}
      `
    )
  }

  // Update node
  node.fields[name] = value
  node.internal.fieldOwners[schemaFieldName] = plugin.name
  node = sanitizeNode(node)

  return {
    ...actionOptions,
    type: `ADD_FIELD_TO_NODE`,
    plugin,
    payload: node,
    addedField: name,
  }
}

/**
 * Creates a link between a parent and child node. This is used when you
 * transform content from a node creating a new child node. You need to add
 * this new child node to the `children` array of the parent but since you
 * don't have direct access to the immutable parent node, use this action
 * instead.
 */
export const createParentChildLink = (
  { parent, child }: { parent: IGatsbyNode; child: IGatsbyNode },
  plugin?: IGatsbyPlugin
): ICreateParentChildLinkAction => {
  if (!parent.children.includes(child.id)) {
    parent.children.push(child.id)
  }

  return {
    type: `ADD_CHILD_NODE_TO_PARENT_NODE`,
    plugin,
    payload: parent,
  }
}

/**
 * Merge additional configuration into the current webpack config. A few
 * configurations options will be ignored if set, in order to try prevent accidental breakage.
 * Specifically, any change to `entry`, `output`, `target`, or `resolveLoaders` will be ignored.
 *
 * For full control over the webpack config, use `replaceWebpackConfig()`.
 */
export const setWebpackConfig = (
  config: webpack.Configuration,
  plugin: IGatsbyPlugin | null = null
): ISetWebpackConfigAction => {
  return {
    type: `SET_WEBPACK_CONFIG`,
    plugin,
    payload: config,
  }
}

/**
 * Completely replace the webpack config for the current stage. This can be
 * dangerous and break Gatsby if certain configuration options are changed.
 *
 * Generally only useful for cases where you need to handle config merging logic
 * yourself, in which case consider using `webpack-merge`.
 */
export const replaceWebpackConfig = (
  config: webpack.Configuration,
  plugin: IGatsbyPlugin | null = null
): IReplaceWebpackConfigAction => {
  return {
    type: `REPLACE_WEBPACK_CONFIG`,
    plugin,
    payload: config,
  }
}

/**
 * Set top-level Babel options. Plugins and presets will be ignored. Use
 * setBabelPlugin and setBabelPreset for this.
 */
export const setBabelOptions = (
  options: ISetBabelOptionsAction["payload"],
  plugin: Optional<IGatsbyPlugin, "id" | "version">
): ISetBabelOptionsAction => {
  // Validate
  const pluginPlaceholder = `Your site's "gatsby-node.js"`
  const hasNoPluginName = !plugin || plugin.name === `default-site-plugin`
  const name = `The plugin "${
    hasNoPluginName ? pluginPlaceholder : plugin!.name
  }"`
  if (typeof options !== `object`) {
    console.log(`${name} must pass an object to "setBabelOptions"`)
    console.log(JSON.stringify(options, null, 4))
    if (process.env.NODE_ENV !== `test`) {
      process.exit(1)
    }
  }

  if (typeof options.options !== `object`) {
    console.log(`${name} must pass options to "setBabelOptions"`)
    console.log(JSON.stringify(options, null, 4))
    if (process.env.NODE_ENV !== `test`) {
      process.exit(1)
    }
  }

  return {
    type: `SET_BABEL_OPTIONS`,
    plugin,
    payload: options,
  }
}

/**
 * Add new plugins or merge options into existing Babel plugins.
 */
export const setBabelPlugin = (
  config: Optional<babel.ConfigItem, "value" | "dirname"> & {
    stage?: BabelStageKeys
  },
  plugin: Optional<IGatsbyPlugin, "id" | "version">
): ISetBabelPluginAction | never => {
  // Validate
  const pluginPlaceholder = `Your site's "gatsby-node.js"`
  const hasNoPluginName = !plugin || plugin.name === `default-site-plugin`
  const name = `The plugin "${
    hasNoPluginName ? pluginPlaceholder : plugin!.name
  }"`
  if (!config.name) {
    console.log(`${name} must set the name of the Babel plugin`)
    console.log(JSON.stringify(config, null, 4))
    if (process.env.NODE_ENV !== `test`) {
      process.exit(1)
    }
  }
  if (!config.options) {
    config.options = {}
  }
  return {
    type: `SET_BABEL_PLUGIN`,
    plugin,
    payload: config as ISetBabelPluginAction["payload"], // Safe because we check for name and options
  }
}

/**
 * Add new presets or merge options into existing Babel presets.
 */
export const setBabelPreset = (
  config: Optional<babel.ConfigItem, "value" | "dirname"> & {
    stage?: BabelStageKeys
  },
  plugin: Optional<IGatsbyPlugin, "id" | "version">
): ISetBabelPresetAction => {
  // Validate
  const pluginPlaceholder = `Your site's "gatsby-node.js"`
  const hasNoPluginName = !plugin || plugin.name === `default-site-plugin`
  const name = `The plugin "${
    hasNoPluginName ? pluginPlaceholder : plugin!.name
  }"`
  if (!config.name) {
    console.log(`${name} must set the name of the Babel preset`)
    console.log(JSON.stringify(config, null, 4))
    if (process.env.NODE_ENV !== `test`) {
      process.exit(1)
    }
  }
  if (!config.options) {
    config.options = {}
  }
  return {
    type: `SET_BABEL_PRESET`,
    plugin,
    payload: config as ISetBabelPresetAction["payload"], // Safe because we check for name and options
  }
}

/**
 * Create a "job". This is a long-running process that are generally
 * started as side-effects to GraphQL queries.
 * [`gatsby-plugin-sharp`](/packages/gatsby-plugin-sharp/) uses this for
 * example.
 *
 * Gatsby doesn't finish its process until all jobs are ended.
 */
export const createJob = (
  job: IGatsbyIncompleteJob["job"],
  plugin?: IGatsbyPlugin
): ICreateJobAction => {
  return {
    type: `CREATE_JOB`,
    plugin,
    payload: job,
  }
}

/**
 * Create a "job". This is a long-running process that are generally
 * started as side-effects to GraphQL queries.
 * [`gatsby-plugin-sharp`](/packages/gatsby-plugin-sharp/) uses this for
 * example.
 *
 * Gatsby doesn't finish its process until all jobs are ended.
 */
export const createJobV2 = (job: IJobV2, plugin: IGatsbyPlugin) => (
  dispatch,
  getState
): ICreateJobV2Action | Promise<any> => {
  // TODO: Remove any
  const currentState = getState()
  const internalJob = createInternalJob(job, plugin)
  const jobContentDigest = internalJob.contentDigest

  // Check if we already ran this job before, if yes we return the result
  // We have an inflight (in progress) queue inside the jobs manager to make sure
  // we don't waste resources twice during the process
  if (
    currentState.jobsV2 &&
    currentState.jobsV2.complete.has(jobContentDigest)
  ) {
    return Promise.resolve(
      currentState.jobsV2.complete.get(jobContentDigest).result
    )
  }

  const inProgressJobPromise = getInProcessJobPromise(jobContentDigest)
  if (inProgressJobPromise) {
    return inProgressJobPromise
  }

  dispatch({
    type: `CREATE_JOB_V2`,
    plugin,
    payload: {
      job: internalJob,
      plugin,
    },
  })

  const enqueuedJobPromise = enqueueJob(internalJob)
  return enqueuedJobPromise.then(result => {
    // store the result in redux so we have it for the next run
    dispatch({
      type: `END_JOB_V2`,
      plugin,
      payload: {
        jobContentDigest,
        result,
      },
    })

    // remove the job from our inProgressJobQueue as it's available in our done state.
    // this is a perf optimisations so we don't grow our memory too much when using gatsby preview
    removeInProgressJob(jobContentDigest)

    return result
  })
}

/**
 * Set (update) a "job". Sometimes on really long running jobs you want
 * to update the job as it continues.
 */
export const setJob = (
  job: IGatsbyIncompleteJob["job"],
  plugin?: IGatsbyPlugin
): ISetJobAction => {
  return {
    type: `SET_JOB`,
    plugin,
    payload: job,
  }
}

/**
 * End a "job".
 *
 * Gatsby doesn't finish its process until all jobs are ended.
 */
export const endJob = (
  job: IGatsbyIncompleteJob["job"],
  plugin?: Optional<IGatsbyPlugin, "id" | "version">
): IEndJobAction => {
  return {
    type: `END_JOB`,
    plugin,
    payload: job,
  }
}

/**
 * Set plugin status. A plugin can use this to save status keys e.g. the last
 * it fetched something. These values are persisted between runs of Gatsby.
 */
export const setPluginStatus = (
  status: Record<string, string>,
  plugin?: Optional<IGatsbyPlugin, "id" | "version">
): ISetPluginStatusAction => {
  return {
    type: `SET_PLUGIN_STATUS`,
    plugin,
    payload: status,
  }
}

// Check if path is absolute and add pathPrefix in front if it's not
const maybeAddPathPrefix = (path: string, pathPrefix: string): string => {
  const parsed = url.parse(path)
  const isRelativeProtocol = path.startsWith(`//`)
  return `${
    parsed.protocol != null || isRelativeProtocol ? `` : pathPrefix
  }${path}`
}

/**
 * Create a redirect from one page to another. Server redirects don't work out
 * of the box. You must have a plugin setup to integrate the redirect data with
 * your hosting technology e.g. the [Netlify
 * plugin](/packages/gatsby-plugin-netlify/), or the [Amazon S3
 * plugin](/packages/gatsby-plugin-s3/). Alternatively, you can use
 * [this plugin](/packages/gatsby-plugin-meta-redirect/) to generate meta redirect
 * html files for redirecting on any static file host.
 */
export const createRedirect = ({
  fromPath,
  isPermanent = false,
  redirectInBrowser = false,
  toPath,
  ...rest
}): ICreateRedirectAction => {
  let pathPrefix = ``
  if (`prefixPaths` in store.getState().program) {
    pathPrefix = store.getState().config.pathPrefix || ``
  }

  return {
    type: `CREATE_REDIRECT`,
    payload: {
      fromPath: maybeAddPathPrefix(fromPath, pathPrefix),
      isPermanent,
      redirectInBrowser,
      toPath: maybeAddPathPrefix(toPath, pathPrefix),
      ...rest,
    },
  }
}

/**
 * Create a dependency between a page and data.
 */
export const createPageDependency = (
  {
    path,
    nodeId,
    connection,
  }: { path: string; nodeId: string; connection: string },
  plugin = ``
): ICreatePageDependencyAction => {
  console.warn(
    `Calling "createPageDependency" directly from actions in deprecated. Use "createPageDependency" from "gatsby/dist/redux/actions/add-page-dependency".`
  )
  return {
    type: `CREATE_COMPONENT_DEPENDENCY`,
    plugin,
    payload: {
      path,
      nodeId,
      connection,
    },
  }
}

/**
 * Set page data in the store, saving the pages content data and context.
 */
export const setPageData = (pageData: IPageData): ISetPageDataAction => {
  return {
    type: `SET_PAGE_DATA`,
    payload: pageData,
  }
}

/**
 * Remove page data from the store.
 */
export const removePageData = (id: IPageDataRemove): IRemovePageDataAction => {
  return {
    type: `REMOVE_PAGE_DATA`,
    payload: id,
  }
}
