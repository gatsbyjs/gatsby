import * as React from "react"
import { Link } from "gatsby"

function ImageUrl({ params }) {
  return (
    <div className="wrapper">
      <header>
        <Link to="/">Go back to "Home"</Link>
      </header>
      <main>
        <p>Here's the image preview of the splat link:</p>
        <img alt="" src={`https://${params.imageUrl}`} />
      </main>
    </div>
  )
}

export default ImageUrl
