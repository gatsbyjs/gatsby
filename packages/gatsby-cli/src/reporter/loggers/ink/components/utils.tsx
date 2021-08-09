import React, { FunctionComponent } from "react"
import { Text, TextProps } from "ink"

export const createLabel = (
  text: string,
  color: string
): FunctionComponent<TextProps> => (...props): JSX.Element => (
  <Text color={color} {...props}>
    {text}
  </Text>
)
