import type { ProcessorOptions } from "@mdx-js/mdx";
import type { GatsbyCache, NodePluginArgs } from "gatsby";
import type { Pluggable } from "unified";
import type { IMdxPluginOptions } from "./plugin-options";

type IGetSourcePluginsAsRemarkPlugins = {
  gatsbyRemarkPlugins: IMdxPluginOptions["gatsbyRemarkPlugins"];
  getNode: NodePluginArgs["getNode"];
  getNodesByType: NodePluginArgs["getNodesByType"];
  pathPrefix: NodePluginArgs["pathPrefix"];
  reporter: NodePluginArgs["reporter"];
  cache: GatsbyCache;
};

export async function getSourcePluginsAsRemarkPlugins({
  gatsbyRemarkPlugins,
  getNode,
  getNodesByType,
  reporter,
  cache,
  pathPrefix,
}: IGetSourcePluginsAsRemarkPlugins): Promise<
  ProcessorOptions["remarkPlugins"]
> {
  const userPluginsFiltered = gatsbyRemarkPlugins
    ? gatsbyRemarkPlugins.filter(
        (plugin) => typeof plugin.module === "function",
      )
    : [];

  if (!userPluginsFiltered.length) {
    return [];
  }

  const userPlugins = userPluginsFiltered.map((plugin) => {
    const requiredPlugin = plugin.module;
    const wrappedGatsbyPlugin: Pluggable = function wrappedGatsbyPlugin() {
      // @ts-ignore rgument of type 'Processor<undefined, undefined, undefined, undefined, undefined>' is not assignable to parameter of type 'string'.ts(2345)
      // No overload matches this call.
      // Overload 1 of 4, '(dataset: Data): Processor<undefined, undefined, undefined, undefined, undefined>', gave the following error.
      // Type '"mdxNodeId"' has no properties in common with type 'Data'.
      // Overload 2 of 4, '(key: "settings"): Settings | undefined', gave the following error.
      // Argument of type '"mdxNodeId"' is not assignable to parameter of type '"settings"'.ts(2769)
      // eslint-disable-next-line @babel/no-invalid-this
      const mdxNode = getNode(this.data("mdxNodeId"));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return async function transformer(markdownAST): Promise<any> {
        // Execute gatsby-remark-* plugin
        await requiredPlugin(
          {
            markdownAST,
            markdownNode: mdxNode,
            getNode,
            getNodesByType,
            get files() {
              return getNodesByType("File");
            },
            pathPrefix,
            reporter,
            cache,
          },
          plugin.pluginOptions || {},
        );
      };
    };

    return wrappedGatsbyPlugin;
  });

  return userPlugins;
}
