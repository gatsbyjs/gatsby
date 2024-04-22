// eslint-disable-next-line @typescript-eslint/naming-convention
import _normalize from "normalize-path"
import memoize from "memoizee"

const normalize: (path: string, stripTrailing?: boolean | undefined) => string =
  memoize(_normalize)

export default normalize
