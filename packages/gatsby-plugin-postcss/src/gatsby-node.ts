import type { GatsbyNode } from "gatsby";
import resolve from "./resolve";

const CSS_PATTERN = /\.css$/;
const MODULE_CSS_PATTERN = /\.module\.css$/;

function isCssRules(rule): boolean {
  return (
    rule.test &&
    (rule.test.toString() === CSS_PATTERN.toString() ||
      rule.test.toString() === MODULE_CSS_PATTERN.toString())
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findCssRules(config: any): any {
  return config.module.rules.find((rule) => {
    return Array.isArray(rule.oneOf) && rule.oneOf.every(isCssRules);
  });
}

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = (
  { actions, stage, loaders, getConfig },
  {
    cssLoaderOptions = {},
    postCssPlugins,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    plugins: _,
    ...postcssLoaderOptions
  },
) => {
  const isSSR = ["develop-html", "build-html"].includes(stage);
  const config = getConfig();
  const cssRules = findCssRules(config);

  if (!postcssLoaderOptions.postcssOptions) {
    postcssLoaderOptions.postcssOptions = {};
  }

  if (postCssPlugins) {
    // @ts-ignore 'postcssLoaderOptions.postcssOptions' is of type 'unknown'.ts(18046)
    postcssLoaderOptions.postcssOptions.plugins = postCssPlugins;
  }

  const postcssLoader = {
    loader: resolve("postcss-loader"),
    options: postcssLoaderOptions,
  };

  const postcssRule = {
    test: CSS_PATTERN,
    use: isSSR
      ? [loaders.null()]
      : [
          loaders.miniCssExtract(),
          loaders.css({
            // @ts-ignore Spread types may only be created from object types.ts(2698)
            ...cssLoaderOptions,
            importLoaders: 1,
            modules: false,
          }),
          postcssLoader,
        ],
  };
  const postcssRuleModules = {
    test: MODULE_CSS_PATTERN,
    use: [
      !isSSR &&
        loaders.miniCssExtract({
          modules: {
            // @ts-ignore 'cssLoaderOptions' is of type 'unknown'.ts(18046)
            namedExport: cssLoaderOptions.modules?.namedExport ?? true,
          },
        }),
      loaders.css({
        // @ts-ignore Spread types may only be created from object types.ts(2698)
        ...cssLoaderOptions,
        importLoaders: 1,
        // @ts-ignore 'cssLoaderOptions' is of type 'unknown'.ts(18046)
        modules: cssLoaderOptions.modules ?? true,
      }),
      postcssLoader,
    ].filter(Boolean),
  };

  const postcssRules = { oneOf: [postcssRuleModules, postcssRule] };

  if (cssRules) {
    cssRules.oneOf.unshift(...postcssRules.oneOf);

    actions.replaceWebpackConfig(config);
  } else {
    actions.setWebpackConfig({ module: { rules: [postcssRules] } });
  }
};
