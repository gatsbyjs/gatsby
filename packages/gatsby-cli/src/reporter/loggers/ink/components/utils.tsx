import React, { FunctionComponent } from "react"
import { Color, ColorProps } from "ink"

export const ColorSwitcher: FunctionComponent<ColorProps> = ({
  children,
  ...props
}) => <Color {...props}>{children}</Color>

export const createLabel = (
  text: string,
  color: string
): FunctionComponent<ColorProps> => (...props): JSX.Element => (
  <ColorSwitcher {...{ [color]: true, ...props }}>{text}</ColorSwitcher>
)
