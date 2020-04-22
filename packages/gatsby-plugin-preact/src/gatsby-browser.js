exports.onClientEntry = () => {
  if (process.env.NODE_ENV !== `production`) {
    console.log(`[HMR] disabled: preact is not compatible with RHL`)
    require(`preact/debug`)
  }
}
