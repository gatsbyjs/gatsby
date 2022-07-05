import { transformSync } from "@babel/core"

module.exports = function loader(source: string): string | null | undefined {
  const result = transformSync(source, {
    babelrc: false,
    configFile: false,
    presets: [
      [
        `@babel/preset-react`,
        {
          useBuiltIns: true,
          pragma: `React.createElement`,
          development: true,
        },
      ],
    ],
    plugins: [
      [
        require.resolve(`./babel/babel-plugin-remove-api`),
        {
          apis: [this.resourceQuery === `?export=default` ? `Head` : `default`],
        },
      ],
    ],
  })

  console.log({ q: this.resourceQuery, code: result?.code })

  return result?.code
}
