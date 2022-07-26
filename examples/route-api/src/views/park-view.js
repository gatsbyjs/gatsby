import * as React from "react"
import { Link } from "gatsby"

function ParkView({ park }) {
  return (
    <div className="wrapper">
      <header>
        <Link to="/">Go back to "Home"</Link>
      </header>
      <main>
        <h1>{park.name}</h1>
        <p>{park.description}</p>
        <p>
          Location: {park.meta.location.place} ({park.meta.location.type})
        </p>
      </main>
      <footer>Delos Corporation.</footer>
    </div>
  )
}

export default ParkView
