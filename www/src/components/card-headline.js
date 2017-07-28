import presets from "../utils/presets"
import { rhythm, scale, options } from "../utils/typography"

const CardHeadline = ({ children }) =>
  <h2
    css={{
      ...scale(2 / 5),
      lineHeight: 1.2,
      marginTop: 0,
      [presets.Tablet]: {
        fontSize: scale(1 / 10).fontSize,
      },
      [presets.Desktop]: {
        fontSize: scale(3 / 10).fontSize,
      },
      [presets.VHd]: {
        fontSize: scale(5 / 10).fontSize,
      },
      [presets.VVHd]: {
        fontSize: scale(7 / 10).fontSize,
      },
    }}
  >
    {children}
  </h2>

export default CardHeadline
