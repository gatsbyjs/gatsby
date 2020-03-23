import { IMatch } from "../types"

const errorParser = ({ err }: { err: unknown }): IMatch => {
  const handlers = [
    {
      regex: /(.+) is not defined/m,
      cb: (match: RegExpMatchArray): IMatch => {
        return {
          id: `11330`,
          context: { sourceMessage: match[0], arg: match[1] },
        }
      },
    },
  ]

  let structured: IMatch | undefined
  let errorMessage: string | undefined

  // try to handle as many type of err as possible.
  // the err might come from a plugin so we don't
  // know what we are getting
  if (Array.isArray(err)) {
    err = err[0]
  }
  if (err instanceof Error) {
    errorMessage = err.message
  }
  if (typeof err === `string`) {
    errorMessage = err
  }

  for (const { regex, cb } of handlers) {
    const matched = errorMessage?.match(regex)
    if (matched) {
      structured = {
        ...cb(matched),
      }
      break
    }
  }

  // if we haven't found any known error
  if (!structured) {
    return {
      id: `11321`,
      context: { sourceMessage: errorMessage || `` },
      error: err instanceof Error ? err : undefined,
    }
  }

  return structured
}

export default errorParser
