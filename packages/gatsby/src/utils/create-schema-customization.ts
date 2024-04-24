import { apiRunnerNode } from "./api-runner-node";
import { store } from "../redux";
import { Span } from "opentracing";

export async function createSchemaCustomization({
  refresh = false,
  parentSpan,
  deferNodeMutation,
}: {
  refresh?: boolean | undefined;
  parentSpan?: Span | undefined;
  deferNodeMutation?: boolean | undefined;
}): Promise<void> {
  if (refresh) {
    store.dispatch({ type: "CLEAR_SCHEMA_CUSTOMIZATION" });
  }
  await apiRunnerNode("createSchemaCustomization", {
    parentSpan,
    deferNodeMutation,
    traceId: !refresh
      ? "initial-createSchemaCustomization"
      : "refresh-createSchemaCustomization",
  });
}
