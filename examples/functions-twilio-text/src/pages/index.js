import * as React from "react"

import "./index.css"

// markup
const IndexPage = () => {
  return (
    <main>
      <div>
        <h2>Send a Text Message via Twilio</h2>
        <form action="/api/twilio" method="POST">
          <div>
            <label htmlFor="to">To</label>
            <input type="phone" name="to" />
          </div>
          <div>
            <label htmlFor="text">Message</label>
            <textarea name="text"></textarea>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </main>
  )
}

export default IndexPage
