import { rhythm, scale, options } from "../utils/typography"
import presets from "../utils/presets"

const FuturaParagraph = ({ children }) => (
  <p
    css={{
      fontFamily: options.headerFontFamily.join(`,`),
      ...scale(1 / 10),
      lineHeight: 1.4,
      marginBottom: 0,
      [presets.Tablet]: {
        ...scale(0 / 10),
        lineHeight: 1.4,
      },
      [presets.VHd]: {
        ...scale(2 / 10),
        lineHeight: 1.4,
      },
      [presets.VVHd]: {
        ...scale(3 / 10),
        lineHeight: 1.4,
      },
    }}
  >
    {children}
  </p>
)

export default FuturaParagraph
