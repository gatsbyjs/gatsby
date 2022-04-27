import path from "path"
import { copyLibFiles } from "@builder.io/partytown/utils"

exports.onPreBootstrap = async ({ store }): Promise<void> => {
  const { program } = store.getState()
  await copyLibFiles(path.join(program.directory, `public`, `~partytown`))
}

exports.createPages = ({ actions }): void => {
  const { createRedirect } = actions

  createRedirect({
    fromPath: `/__partytown-proxy?url=:url`,
    toPath: `:url`,
    statusCode: 200,
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "/__partytown-proxy": [`Access-Control-Allow-Origin: *`],
    },
  })

  createRedirect({
    fromPath: `/some-page`,
    toPath: `/second`,
  })
}
