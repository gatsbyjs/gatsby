export function onClientEntry() {
  if (process.env.NODE_ENV !== `production`) {
    require(`preact/debug`)

    require(`./fast-refresh/prefreshGlueCode`)()
  }
}
