import React from "react"
import { navigate } from "gatsby"
import Form from "./Form"
import View from "./View"
import { handleLogin, isLoggedIn } from "../utils/auth"

function Login() {
  function handleUpdate(event) {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    handleLogin(this.state)
  }

  if (isLoggedIn()) {
navigate(`/app/profile`)
}

return (
<View title="Log In">
<Form
handleUpdate={e => handleUpdate(e)}
handleSubmit={e => handleSubmit(e)}
/>
</View>
);
}

export default Login
