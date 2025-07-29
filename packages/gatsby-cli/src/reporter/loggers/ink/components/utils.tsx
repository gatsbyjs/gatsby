import React, { FunctionComponent } from "react"
import { Text, TextProps } from "ink"

export const createLabel =
  (text: string, color: string): FunctionComponent<TextProps> =>
  (...props): React.ReactNode =>
    (
      <Text color={color} {...props}>
        {text}
      </Text>
    )
