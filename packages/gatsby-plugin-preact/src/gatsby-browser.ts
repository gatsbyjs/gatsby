import type { GatsbyBrowser } from 'gatsby'

export const onClientEntry: GatsbyBrowser['onClientEntry'] = () => {
  if (process.env.NODE_ENV !== `production`) {
    require(`preact/debug`)

    require(`./fast-refresh/prefreshGlueCode`)()
  }
}
