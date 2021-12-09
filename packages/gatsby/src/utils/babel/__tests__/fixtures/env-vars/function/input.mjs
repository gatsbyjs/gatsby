import React from 'react'

function MyComponent() {
  const shouldNotBeReplaced = process.env.REPLACE_ME

  return <div>Hello World! {process.env.REPLACE_ME}</div>
}

export async function getServerData() {
  const shouldBeReplaced = process.env.REPLACE_ME

  return {
    props: {
      shouldBeReplaced
    }
  }
}

export async function config() {
  const shouldNotBeReplaced = process.env.REPLACE_ME

  return {
    defer: shouldNotBeReplaced
  }
}

export default MyComponent
