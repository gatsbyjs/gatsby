import { FunctionComponent } from "react"
import { Text, TextProps } from "ink"

export function createLabel(
  text: string,
  color: string,
): FunctionComponent<TextProps> {
  return (...props): JSX.Element => {
    return (
      <Text color={color} {...props}>
        {text}
      </Text>
    )
  }
}
