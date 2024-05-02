import { getCacheDir } from "./node-apis/node-utils";
import {
  ImageFormatType,
  ImageLayoutType,
  ImagePlaceholderType,
} from "./resolver-utils";

export * from "./node-apis/preprocess-source";

export function createSchemaCustomization({ actions, schema }): void {
  actions.createTypes([
    schema.buildEnumType(ImageFormatType),
    schema.buildEnumType(ImageLayoutType),
    schema.buildEnumType(ImagePlaceholderType),
  ]);
}

export function onCreateBabelConfig({ actions, store }): void {
  const root = store.getState().program.directory;

  const cacheDir = getCacheDir(root);

  actions.setBabelPlugin({
    name: require.resolve("./babel-plugin-parse-static-images"),
    options: {
      cacheDir,
    },
  });
}

export function onCreateWebpackConfig({ stage, plugins, actions }): void {
  if (
    stage !== "develop" &&
    stage !== "build-javascript" &&
    stage !== "build-html"
  ) {
    return;
  }

  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        GATSBY___IMAGE: true,
      }),
    ],
  });
}
