declare const _CFLAGS_: {
  GATSBY_MAJOR: string
}

export const usingGatsbyV4OrGreater = Number(_CFLAGS_.GATSBY_MAJOR) >= 4
