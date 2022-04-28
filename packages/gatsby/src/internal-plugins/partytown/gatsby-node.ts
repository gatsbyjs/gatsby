import path from "path"
import { copyLibFiles } from "@builder.io/partytown/utils"

exports.onPreBootstrap = async ({ store }): Promise<void> => {
  const { program } = store.getState()
  await copyLibFiles(path.join(program.directory, `public`, `~partytown`))
}

exports.createPages = ({ actions }): void => {
  const { createRedirect } = actions

  /**
   * TODO - Consider the security implications of including a reverse proxy like this.
   *
   * If we can't find a way to ensure this isn't exploited then we should scrap it
   * and point users to Partytown docs so that they can solve for their scenarios as needed.
   *
   * @see {@link https://partytown.builder.io/proxying-requests}
   */
  createRedirect({
    fromPath: `/__partytown-proxy?url=:url`,
    toPath: `:url`,
    statusCode: 200,
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "/__partytown-proxy": [`Access-Control-Allow-Origin: *`],
    },
  })
}
