import * as React from "react";
import { Link } from "gatsby";

export function Nav() {
  return (
    <ul>
      <li>
        <Link to="/">
          index <code>/</code>
        </Link>
      </li>
      <li>
        <Link to="/second/">
          index <code>/second/</code>
        </Link>
      </li>
    </ul>
  );
}
