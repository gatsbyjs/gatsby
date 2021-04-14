import * as t from "@babel/types"
import template from "@babel/template"

export default function buildPluginNode({ name, options, key }) {
  if (!options && !key) {
    return t.stringLiteral(name)
  }

  const pluginWithOptions = template(
    `
    const foo = {
      resolve: '${name}',
      options: ${JSON.stringify(options, null, 2)},
      ${key ? `__key: "` + key + `"` : ``}
    }
  `,
    { placeholderPattern: false }
  )()

  return pluginWithOptions.declarations[0].init
}
