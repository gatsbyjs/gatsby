import { CreateNodeArgs } from "gatsby"
import glob from "globby"
import { IOptions, IPluginState } from "../types"

export async function onCreateNode(
  { node, store, actions }: CreateNodeArgs,
  { path }: IOptions
): Promise<void> {
  const { program, status } = store.getState()
  const state = (status.plugins[
    `gatsby-plugin-page-creator`
  ] as any) as IPluginState

  // We do not need this in bootstrap
  if (state.isInBootstrap) {
    return
  }

  const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`)
  const pagesGlob = `**/*.{${exts}}`

  const files = (await glob(pagesGlob, { cwd: path })).filter(filePath =>
    filePath.includes(`{${node.internal.type}`)
  )

  if (files.length) {
    const { status } = store.getState()
    const state = (status.plugins[
      `gatsby-plugin-page-creator`
    ] as any) as IPluginState

    actions.setPluginStatus({
      ...state,
      nodes: [...state.nodes, { node, files }].filter(Boolean),
    })
  }
}
