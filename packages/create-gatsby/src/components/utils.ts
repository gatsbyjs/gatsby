import stringLength from "string-length"
// ansi and emoji-safe string length

export function rule(char = `\u2501`): string {
  return char.repeat(process.stdout.columns)
}

export function center(text: string, padding = ` `): string {
  const pad = padding.repeat(
    Math.round((process.stdout.columns - stringLength(text)) / 2)
  )
  return pad + text + pad
}
