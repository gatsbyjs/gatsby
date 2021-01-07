import * as React from "react"
export function LaterHydrator({
  children,
}: React.PropsWithChildren<{}>): React.ReactNode {
  React.useEffect(() => {
    import(`./lazy-hydrate`)
  }, [])

  return children
}
