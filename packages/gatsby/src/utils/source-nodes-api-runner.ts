import { Span } from "opentracing";
import { apiRunnerNode } from "./api-runner-node";
import Promise from "bluebird";

type SourceNodesApiRunnerConfig = {
  traceId: string;
  webhookBody: unknown;
  pluginName?: string | undefined;
  parentSpan?: Span | undefined;
  deferNodeMutation?: boolean | undefined;
};

export function sourceNodesApiRunner({
  traceId,
  deferNodeMutation,
  parentSpan,
  webhookBody,
  pluginName,
}: SourceNodesApiRunnerConfig): Promise<unknown> | null {
  return apiRunnerNode("sourceNodes", {
    traceId,
    waitForCascadingActions: true,
    deferNodeMutation,
    parentSpan,
    webhookBody: webhookBody || {},
    pluginName,
  });
}
