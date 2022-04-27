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

  // TODO - Remove this once we have determined that redirects are actually applied in Cloud, this is just a test
  createRedirect({
    fromPath: `/some-page`,
    toPath: `/second`,
  })
}
