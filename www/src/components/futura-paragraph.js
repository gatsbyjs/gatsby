import { rhythm, scale, options } from "../utils/typography"
import presets from "../utils/presets"

const FuturaParagraph = ({ children }) =>
  <p
    css={{
      fontFamily: options.headerFontFamily.join(`,`),
      ...scale(1 / 10),
      marginBottom: 0,
      [presets.Tablet]: {
        ...scale(0 / 10),
      },
      [presets.VHd]: {
        ...scale(2 / 10),
      },
      [presets.VVHd]: {
        ...scale(3 / 10),
      },
    }}
  >
    {children}
  </p>

export default FuturaParagraph
