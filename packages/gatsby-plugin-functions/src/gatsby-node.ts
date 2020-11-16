import {
  CreatePagesArgs,
  ParentSpanPluginArgs,
  SetFieldsOnGraphQLNodeTypeArgs,
  PluginOptions,
  PluginCallback,
} from "gatsby"

const sleep = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

export async function onPreInit(
  { reporter }: ParentSpanPluginArgs,
  { path: pagesPath }: PluginOptions
): Promise<void> {
  const activity = reporter.activityTimer(`Building Gatsby Functions`)
  await sleep(1000)
  activity.end()
}
