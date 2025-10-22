import React from "react"
import { Link } from "gatsby"
import "./style.css"

function SiteNav({location}) {
  return (
<nav className="blog-nav">
<ul>
<li>
<Link
to="/"
className={location.pathname === `/` ? `current` : null}
>
{` `}
Articles
</Link>
</li>
<li>
<Link
to="/about/"
className={location.pathname === `/about/` ? `current` : null}
>
{` `}
About
</Link>
</li>
<li>
<Link
to="/contact/"
className={location.pathname === `/contact/` ? `current` : null}
>
{` `}
Contact
</Link>
</li>
</ul>
</nav>
);
}

export default SiteNav
