import path from "path"
import { copyLibFiles } from "@builder.io/partytown/utils"

exports.onPreBootstrap = async ({ store }): Promise<void> => {
  const { program } = store.getState()
  await copyLibFiles(path.join(program.directory, `public`, `~partytown`))
}
