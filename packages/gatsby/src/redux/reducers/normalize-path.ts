import _normalize from "normalize-path"
import memoize from "memoizee"

const normalize = memoize(_normalize)

export default normalize
