import React from "react"
import View from "./View"
import { getCurrentUser } from "../utils/auth"

const Home = () => {
  const { name } = getCurrentUser()

  return (
    <View title="Your Profile">
      <p>Welcome back, {name}!</p>
    </View>
  )
}

export default Home
