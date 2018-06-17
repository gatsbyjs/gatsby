import React from "react"
import { Link } from "gatsby"
import "./index.css"

const IndexPage = ({ data }) => (
  <div>
    <div className="page-grid">
      <div className="address-section">
        <h4>Address</h4>
        <div>{data.personalData.address.streetAddress}</div>
        <div>{data.personalData.address.streetName}</div>
        <div>{data.personalData.address.city}</div>
        <div>
          {data.personalData.address.state} -
          {data.personalData.address.zipCode}
        </div>
      </div>
      <div className="email-section">
        {data.personalData.internet.email} /
        {data.personalData.phone.phoneNumber}
      </div>
      <div className="summary-section">
        <h4> Summary</h4>
        {data.personalData.lorem.paragraph}
      </div>
    </div>
    <div className="company-section">
      <h3>Worked at</h3>
      {data.allCompanyData.edges.map(({ node }) => (
        <div>
          <div>{node.company.companyName}</div>
          <div>{node.company.companySuffix}</div>
        </div>
      ))}
    </div>
  </div>
)

export default IndexPage

export const query = graphql`
  query CompanyQuery {
    allCompanyData {
      edges {
        node {
          id
          company {
            companyName
            companySuffix
          }
        }
      }
    }
    personalData {
      id
      internet {
        email
      }
      phone {
        phoneNumber
      }
      address {
        streetAddress
        streetName
        city
        state
        zipCode
      }
      lorem {
        paragraph
      }
    }
  }
`
