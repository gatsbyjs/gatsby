interface IArg {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function preferDefault(m: IArg): any | IArg {
  return (m && m.default) || m
}
