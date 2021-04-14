import { GatsbyNode } from "gatsby"
import { getCacheDir } from "./node-apis/node-utils"

export * from "./node-apis/preprocess-source"

export const onCreateBabelConfig: GatsbyNode["onCreateBabelConfig"] = ({
  actions,
  store,
}) => {
  const root = store.getState().program.directory

  const cacheDir = getCacheDir(root)

  actions.setBabelPlugin({
    name: require.resolve(`./babel-plugin-parse-static-images`),
    options: {
      cacheDir,
    },
  })
}

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  stage,
  plugins,
  actions,
}) => {
  if (
    stage !== `develop` &&
    stage !== `build-javascript` &&
    stage !== `build-html`
  ) {
    return
  }

  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        GATSBY___IMAGE: true,
      }),
    ],
  })
}
