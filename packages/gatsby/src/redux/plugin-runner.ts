import { Span } from "opentracing"
import { emitter, store } from "./index"
import apiRunnerNode from "../utils/api-runner-node"
import { ActivityTracker } from "../../"
import { ICreateNodeAction } from "./types"

type Plugin = any // TODO

// This might make sense to live somewhere else
interface ICreatePageAction {
  graphql<TData, TVariables = any>(
    query: string,
    variables?: TVariables
  ): Promise<{
    errors?: any
    data?: TData
  }>
  traceId: "initial-createPages"
  waitForCascadingActions: boolean
  parentSpan: Span
  activity: ActivityTracker
  type: `CREATE_PAGE`
  contextModified: boolean
  plugin: Plugin
  payload: {
    id: string
    children: any
    internal: Record<string, unknown>
    internalComponentName: string
    path: string
    matchPath: string | undefined
    component: string
    componentChunkName: string
    isCreatedByStatefulCreatePages: boolean
    context: {
      slug: string
      id: string
    }
    updatedAt: number
    // eslint-disable-next-line @typescript-eslint/naming-convention
    pluginCreator___NODE: string
    pluginCreatorId: string
    componentPath: string
  }
}

export const startPluginRunner = (): void => {
  const plugins = store.getState().flattenedPlugins
  const implementingPlugins = plugins.filter(plugin =>
    plugin.nodeAPIs.includes(`onCreatePage`)
  )
  if (implementingPlugins.length > 0) {
    emitter.on(`CREATE_PAGE`, (action: ICreatePageAction) => {
      const page = action.payload
      apiRunnerNode(
        `onCreatePage`,
        { page, traceId: action.traceId, parentSpan: action.parentSpan },
        { pluginSource: action.plugin.name, activity: action.activity }
      )
    })
  }

  // We make page nodes special so call onCreateNode here.
  emitter.on(`CREATE_NODE`, (action: ICreateNodeAction) => {
    const node = action.payload
    apiRunnerNode(`onCreateNode`, {
      node,
      traceTags: { nodeId: node.id, nodeType: node.internal.type },
    })
  })
}
