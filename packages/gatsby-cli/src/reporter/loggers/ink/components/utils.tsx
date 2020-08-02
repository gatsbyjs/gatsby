import React, { FunctionComponent } from "react"
import { Text, TextProps } from "ink"

export const ColorSwitcher: FunctionComponent<TextProps> = ({
  children,
  ...props
}) => <Text {...props}>{children}</Text>

export const createLabel = (
  text: string,
  color: string
): FunctionComponent<TextProps> => (...props): JSX.Element => (
  <ColorSwitcher {...{ color, ...props }}>{text}</ColorSwitcher>
)
