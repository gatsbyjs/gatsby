import startIntervalRefetcher from "./source-nodes/interval-refetcher"

export default (helpers, pluginOptions) => {
  if (process.env.NODE_ENV !== `production`) {
    startIntervalRefetcher({}, helpers, pluginOptions)
  }
}
