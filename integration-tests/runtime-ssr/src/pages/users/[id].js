import * as React from "react"
import fetch from "cross-fetch"

export default function User(props) {
  console.log({ props })
  return (
    <div>
      <h1>hi shannon & henry</h1>
      <ul>
        <li>user: {props.serverProps.user}</li>
        <li>super: {props.serverProps.super.toString()}</li>
        <li>random: {props.serverProps.random}</li>
        <li>
          todos:{" "}
          <ul>
            {props.serverProps.todos.map(todo => (
              <li>{todo.title}</li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  )
}

export async function getServerProps(req, res) {
  console.log(req.params)
  const data = await fetch(
    `https://jsonplaceholder.typicode.com/todos/`
  ).then(res => res.json())

  return {
    props: {
      user: req.params.id + ` hello`,
      super: true,
      random: Math.random(),
      todos: data.slice(0, 10),
    },
  }
}
