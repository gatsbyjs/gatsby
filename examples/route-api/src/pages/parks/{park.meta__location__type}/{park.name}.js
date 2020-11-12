import * as React from "react"
import { graphql } from "gatsby"
import ParkView from "../../../views/park-view"

function ParkLocationPlace(props) {
  const { park } = props.data
  return <ParkView park={park} />
}

export default ParkLocationPlace

export const query = graphql`
  query($id: String!) {
    park(id: { eq: $id }) {
      name
      description
      meta {
        id
        location {
          type
          place
        }
      }
    }
  }
`
