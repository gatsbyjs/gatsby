declare const _CFLAGS_: {
  GATSBY_MAJOR: string
}

declare module NodeJS {
  interface Global {
    __GATSBY: {
      buildId: string
      root: string
    }

    polyfill_remote_file_cache?: import("gatsby").GatsbyCache
  }
}
