import { Span } from "opentracing";
import { emitter, store } from "./index";
import { apiRunnerNode } from "../utils/api-runner-node";
import type { ActivityTracker } from "../../";
import type { ICreateNodeAction } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Plugin = any; // TODO

// This might make sense to live somewhere else
type ICreatePageAction = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graphql<TData, TVariables = any>(
    query: string,
    variables?: TVariables | undefined,
  ): Promise<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors?: any | undefined;
    data?: TData | undefined;
  }>;
  traceId: "initial-createPages";
  waitForCascadingActions: boolean;
  parentSpan: Span;
  activity: ActivityTracker;
  type: "CREATE_PAGE";
  contextModified: boolean;
  plugin: Plugin;
  payload: {
    internalComponentName: string;
    path: string;
    matchPath: string | undefined;
    component: string;
    componentChunkName: string;
    isCreatedByStatefulCreatePages: boolean;
    context: {
      slug: string;
      id: string;
    };
    updatedAt: number;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    pluginCreator___NODE: string;
    pluginCreatorId: string;
    componentPath: string;
  };
};

export function startPluginRunner(): void {
  const plugins = store.getState().flattenedPlugins;
  const pluginsImplementingOnCreatePage = plugins.filter((plugin) =>
    plugin.nodeAPIs.includes("onCreatePage"),
  );
  const pluginsImplementingOnCreateNode = plugins.filter((plugin) =>
    plugin.nodeAPIs.includes("onCreateNode"),
  );
  if (pluginsImplementingOnCreatePage.length > 0) {
    emitter.on("CREATE_PAGE", (action: ICreatePageAction) => {
      const page = action.payload;
      apiRunnerNode(
        "onCreatePage",
        { page, traceId: action.traceId, parentSpan: action.parentSpan },
        { pluginSource: action.plugin.name, activity: action.activity },
      );
    });
  }

  // We make page nodes outside of the normal action for speed so we manually
  // call onCreateNode here for SitePage nodes.
  if (pluginsImplementingOnCreateNode.length > 0) {
    emitter.on("CREATE_NODE", (action: ICreateNodeAction) => {
      const node = action.payload;
      if (node.internal.type === "SitePage") {
        apiRunnerNode("onCreateNode", {
          node,
          parentSpan: action.parentSpan,
          traceTags: { nodeId: node.id, nodeType: node.internal.type },
        });
      }
    });
  }
}
