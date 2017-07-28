import presets from "../utils/presets"
import { rhythm, scale, options } from "../utils/typography"
import { vP, vPHd, vPVHd, vPVVHd } from "../components/gutters"

const Cards = ({ children }) =>
  <div
    css={{
      display: `flex`,
      flex: `0 1 auto`,
      flexWrap: `wrap`,
      background: `rgba(255, 255, 255, 0.975)`,
      borderRadius: presets.radiusLg,
      boxShadow: `0 5px 20px rgba(25, 17, 34, 0.1)`,
    }}
  >
    {children}
  </div>

export default Cards
