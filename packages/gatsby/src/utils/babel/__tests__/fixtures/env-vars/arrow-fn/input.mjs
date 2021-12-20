import React from 'react'

const MyComponent = () => {
  const shouldNotBeReplaced = process.env.REPLACE_ME

  return <div>Hello World! {process.env.REPLACE_ME}</div>
}

export const getServerData = async () => {
  const shouldBeReplaced = process.env.REPLACE_ME

  return {
    props: {
      shouldBeReplaced
    }
  }
}

export const config = async () => {
  const shouldNotBeReplaced = process.env.REPLACE_ME

  return {
    defer: shouldNotBeReplaced
  }
}

export default MyComponent
