import React from "react"
import { Redirect } from "react-router-dom"
import Form from "./Form"
import View from "./View"
import { handleLogin, isLoggedIn } from "../utils/auth"

class Login extends React.Component {
  state = {
    username: ``,
    password: ``,
  }

  handleUpdate(event) {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  handleSubmit(event) {
    event.preventDefault()
    handleLogin(this.state)
  }

  render() {
    if (isLoggedIn()) {
      return <Redirect to={{ pathname: `/app/profile` }} />
    }

    return (
      <View title="Log In">
        <Form
          handleUpdate={e => this.handleUpdate(e)}
          handleSubmit={e => this.handleSubmit(e)}
        />
      </View>
    )
  }
}

export default Login
