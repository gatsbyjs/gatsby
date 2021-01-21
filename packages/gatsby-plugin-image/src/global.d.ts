export {}

declare global {
  declare var SERVER: boolean

  namespace NodeJS {
    interface Global {
      GATSBY___IMAGE: boolean | undefined
    }
  }
}
