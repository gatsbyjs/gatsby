import React from "react"
import { withRouter } from "react-router-dom"
import styles from "./form.module.css"

export default withRouter(({ handleSubmit, handleUpdate, history }) => (
  <form
    className={styles.form}
    method="post"
    onSubmit={event => {
      handleSubmit(event)
      history.push(`/app/profile`)
    }}
  >
    <p className={styles[`form__instructions`]}>
      For this demo, please log in with the username <code>gatsby</code> and the
      password <code>demo</code>.
    </p>
    <label className={styles[`form__label`]}>
      Username
      <input
        className={styles[`form__input`]}
        type="text"
        name="username"
        onChange={handleUpdate}
      />
    </label>
    <label className={styles[`form__label`]}>
      Password
      <input
        className={styles[`form__input`]}
        type="password"
        name="password"
        onChange={handleUpdate}
      />
    </label>
    <input className={styles[`form__button`]} type="submit" value="Log In" />
  </form>
))
