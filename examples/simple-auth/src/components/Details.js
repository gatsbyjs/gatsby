import React from "react"
import View from "./View"
import { getCurrentUser } from "../utils/auth"

const Details = () => {
  const { name, legalName, email } = getCurrentUser()

  return (
    <View title="Your Details">
      <ul>
        <li>Preferred name: {name}</li>
        <li>Legal name: {legalName}</li>
        <li>Email address: {email}</li>
      </ul>
    </View>
  )
}

export default Details
