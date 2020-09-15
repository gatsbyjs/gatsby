import * as fs from "fs"
import * as path from "path"

export function onPostBootstrap({ store }): void {
  const {
    program,
  }: {
    program: any
  } = store.getState()

  const cachePath = program.directory && path.join(program.directory, `.cache`)

  if (cachePath && fs.existsSync(cachePath)) {
    const configJSONString = JSON.stringify(
      {
        schema: `.cache/schema.graphql`,
        documents: [
          `src/**/**.{ts,js,tsx,jsx,esm}`,
          `.cache/fragments.graphql`,
        ],
        extensions: {
          endpoints: {
            default: {
              url: `${program.https ? `https://` : `http://`}${program.host}:${
                program.p
              }/___graphql`,
            },
          },
        },
      },
      null,
      2
    )

    fs.writeFileSync(
      path.join(cachePath, `graphql.config.json`),
      configJSONString
    )
  }
}
