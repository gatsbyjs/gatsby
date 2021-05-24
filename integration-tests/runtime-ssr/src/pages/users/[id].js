import * as React from "react"

export default function User(props) {
  console.log({ props })
  return (
    <div>
      <ul>
        <li>user: {props.serverProps.user}</li>
        <li>super: {props.serverProps.super.toString()}</li>
        <li>random: {props.serverProps.random}</li>
      </ul>
    </div>
  )
}

export function getServerProps(req, res) {
  console.log(req.params)
  return {
    props: {
      user: req.params.id + ` hello`,
      super: true,
      random: Math.random(),
    },
  }
}
