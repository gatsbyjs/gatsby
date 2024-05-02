import type { CreateWebpackConfigArgs, GatsbyNode } from "../../..";

const GatsbyThemeComponentShadowingResolverPlugin = require(".");

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] =
  function onCreateWebpackConfig({
    store,
    actions,
  }: CreateWebpackConfigArgs): void {
    const { flattenedPlugins, program } = store.getState();

    actions.setWebpackConfig({
      resolve: {
        plugins: [
          new GatsbyThemeComponentShadowingResolverPlugin({
            extensions: program.extensions,
            themes: flattenedPlugins.map((plugin) => {
              return {
                themeDir: plugin.pluginFilepath,
                themeName: plugin.name,
              };
            }),
            projectRoot: program.directory,
          }),
        ],
      },
    });
  };
