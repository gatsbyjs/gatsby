declare module 'parse-filepath' {
  declare type FileData = {
    root: string,
    dir: string,
    base: string,
    ext: string,
    name: string,

    // aliases
    extname: string,
    basename: string,
    dirname: string,
    stem: string,

    // original path
    path: string,

    // getters
    absolute: () => string,
    isAbsolute: () => Boolean
  }

  declare var exports: (input: string) => FileData
}
