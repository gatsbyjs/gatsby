import { transformSync } from "@babel/core"
import { GatsbyNodeAPI } from "../../redux/types"
import * as nodeApis from "../../utils/api-node-docs"
import { schemaCustomizationAPIs } from "./print-plugins"

module.exports = function loader(source: string): string | null | undefined {
  const result = transformSync(source, {
    babelrc: false,
    configFile: false,
    plugins: [
      [
        require.resolve(`../../utils/babel/babel-plugin-remove-api`),
        {
          apis: (Object.keys(nodeApis) as Array<GatsbyNodeAPI>).filter(
            api => !schemaCustomizationAPIs.has(api)
          ),
        },
      ],
    ],
  })

  return result?.code
}
