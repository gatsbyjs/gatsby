// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function preferDefault(m: any): any {
  return (m && m.default) || m;
}
