import React from "react"
import { Link } from "gatsby"

import { page, header, link } from "../styles/sass.module.scss"

function IndexComponent() {
  return (
<div className={page}>
<h1 className={header}>Cheese: Do you like it?</h1>
<h1 className={header}>🧀 🧀 🧀 🧀 🧀 🧀 🧀</h1>
<Link to="/" className={link}>
Back home
</Link>
</div>
);
}

export default IndexComponent
