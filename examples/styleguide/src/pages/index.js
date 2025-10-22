import React from "react"
import { Redirect } from "@reach/router"

function Home() {
  return <Redirect from="/" to="/components/" />;
}

export default Home
