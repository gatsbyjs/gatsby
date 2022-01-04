import * as React from "react"

export default function SendGridUI() {
  return (
    <form action="/api/sendgrid" method="POST">
      <h2 style={{ marginBottom: `16px` }}>Send email via SendGrid</h2>
      <div style={{ marginBottom: `8px` }}>
        <label
          style={{ display: `block`, marginBottom: `4px` }}
          htmlFor="email"
        >
          To:
        </label>
        <input name="email" id="email" type="email" />
      </div>
      <div style={{ marginBottom: `8px` }}>
        <label
          style={{ display: `block`, marginBottom: `4px` }}
          htmlFor="subject"
        >
          Subject:
        </label>
        <input name="subject" id="subject" />
      </div>
      <div style={{ marginBottom: `24px` }}>
        <label style={{ display: `block`, marginBottom: `4px` }} htmlFor="text">
          Message:
        </label>
        <textarea name="text" id="text" />
      </div>
      <div>
        <button>Send email</button>
      </div>
    </form>
  )
}
