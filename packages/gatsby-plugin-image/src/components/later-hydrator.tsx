import * as React from "react"
export function LaterHydrator({
  children,
}: React.PropsWithChildren<Record<string, unknown>>): React.ReactNode {
  React.useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    import(`./lazy-hydrate`)
  }, [])

  return children
}
