import * as React from "react"
import { graphql } from "gatsby"
import ParkView from "../../views/park-view"

function ParkName(props) {
  const { park } = props.data
  return <ParkView park={park} />
}

export default ParkName

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
