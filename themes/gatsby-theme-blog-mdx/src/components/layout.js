import React from "react"
import { useTypography, TypographyProvider } from "typography-system"

export default ({ children }) => {
  const typography = useTypography()

  return (
    <TypographyProvider theme={typography}>
      <div>{children}</div>
    </TypographyProvider>
  )
}
