/* eslint-disable @babel/no-invalid-this */

import { LoaderDefinitionFunction } from "webpack"
import { transform } from "@babel/core"

interface IOptions {
  jsx?: boolean
  remove?: Array<string>
}

const webpackRemoveExportsLoader: LoaderDefinitionFunction<IOptions> =
  function webpackRemoveExportsLoader(source, sourceMap): void {
    const callback = this.async()
    const options = this.getOptions()

    transform(
      source,
      {
        babelrc: false,
        configFile: false,
        // @ts-ignore inputSourceMap expect object or falsy, but webpack types suggest sourceMap can be a string,
        // which is not compatibile with babel's transform options
        inputSourceMap: this.sourceMap ? sourceMap || undefined : undefined,
        sourceFileName: this.resourcePath,
        sourceMaps: this.sourceMap,
        filename: this.resourcePath,
        presets: options?.jsx
          ? [
              [
                require.resolve(`babel-preset-gatsby/babel-preset-react`),
                {
                  useBuiltIns: true,
                  pragma: `React.createElement`,
                  // jsx is used only in develop, so for now this is fine
                  development: true,
                },
              ],
            ]
          : undefined,
        plugins: [
          [
            require.resolve(`../../babel/babel-plugin-remove-api`),
            {
              apis: options?.remove ?? [],
            },
          ],
        ],
      },
      (err, result) => {
        if (err) {
          callback(err)
        } else if (result && result.code) {
          callback(null, result?.code, result?.map ?? undefined)
        } else {
          callback(null, source, sourceMap)
        }
      }
    )
  }

module.exports = webpackRemoveExportsLoader
