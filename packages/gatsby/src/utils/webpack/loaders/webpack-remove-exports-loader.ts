import { LoaderContext } from "webpack"
import { transformSync } from "@babel/core"

interface IOptions {
  jsx?: boolean
  remove?: Array<string>
}

module.exports = function loader(
  this: LoaderContext<IOptions>,
  source: string
): string | null | undefined {
  const options = this.getOptions()

  const result = transformSync(source, {
    babelrc: false,
    configFile: false,
    presets: options?.jsx
      ? [
          [
            `@babel/preset-react`,
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
  })

  return result?.code
}
