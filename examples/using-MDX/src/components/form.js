import React from "react"
const Form = () => {
  return (
    <form
      style={{
        borderRadius: "5px",
        backgroundColor: "#f2f2f2",
        padding: "20px",
        display: "inline-block",
      }}
    >
      <label>
        Email: <input type="email" name="email" />
      </label>
      <label>
        Name: <input type="text" name="Name" />
      </label>
      <input type="submit" value="submit" />
    </form>
  )
}

export default Form
