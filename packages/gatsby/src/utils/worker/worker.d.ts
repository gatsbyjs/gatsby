declare module NodeJS {
  interface Global {
    unsafeBuiltinUsage: Array<string> | undefined
  }
}
