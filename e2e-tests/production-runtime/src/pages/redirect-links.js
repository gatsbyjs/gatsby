import * as React from "react"
import { Link } from "gatsby"

export default function RedirectLinks() {
  return (
    <ul>
      <li>
        <Link to="/Longue-PAGE">/Longue-PAGE</Link>
      </li>
      <li>
        <Link to="/pagina-larga">/pagina-larga</Link>
      </li>
    </ul>
  )
}
