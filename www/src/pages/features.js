import React, { Component } from 'react';
import EvaluationTable from '../components/evaluation-table';
import EvaluationCell from '../components/evaluation-cell';
import FuturaParagraph from "../components/futura-paragraph"
import Container from "../components/container"
import { options } from "../utils/typography"

const LegendTable = () => {
  const legendBallStyle = {
    float: `none`,
    marginLeft: 0,
    marginRight: 0,
    display: `inline-block`,
  }

  const legendBallCellStyle = {
    display: `table-cell`,
    verticalAlign: `middle`,
    textAlign: `center`,
    padding: 10,
    borderLeft: `1px solid #dddddd`,
    borderBottom: `1px solid #dddddd`,
  }

  const legendExplanationCellStyle = {
    display: `table-cell`,
    verticalAlign: `middle`,
    textAlign: `center`,
    padding: 10,
    borderLeft: `1px solid #dddddd`,
  }

  return (
    <div css={{
      display: `table`,
      border: `1px solid #dddddd`,
      borderLeft: 0,
      fontFamily: options.headerFontFamily.join(`,`),
    }}>
      <div css={{display: `table-row`}}>
        <div css={legendBallCellStyle}>
          <h5 style={{margin: 0}}>Icon</h5>
        </div>
        <div css={legendBallCellStyle}>
          <EvaluationCell
            num="3"
            style={legendBallStyle}
          />
        </div>
        <div css={legendBallCellStyle}>
          <EvaluationCell
            num="2"
            style={legendBallStyle}
          />
        </div>
        <div css={legendBallCellStyle}>
          <EvaluationCell
            num="1"
            style={legendBallStyle}
          />
        </div>
        <div css={legendBallCellStyle}>
          <EvaluationCell
            num="0"
            style={legendBallStyle}
          />
        </div>
      </div>
      <div css={{display: `table-row`}}>
        <div css={legendExplanationCellStyle}>
          <h5 style={{margin: 0}}>Feature Availability</h5>
        </div>
        <div css={legendExplanationCellStyle}>
          Out of the box
        </div>
        <div css={legendExplanationCellStyle}>
          Plugins available
        </div>
        <div css={legendExplanationCellStyle}>
          Needs customization
        </div>
        <div css={legendExplanationCellStyle}>
          Not possible
        </div>
      </div>
    </div>
  )
}

const FeaturesHeader = () => {
  return (
    <div>
      <h1 style={{marginTop: 0}}>Features</h1>
      <FuturaParagraph>
        There are many ways to build a website. If you're considering Gatsby, you may also be looking at some alternatives:
      </FuturaParagraph>
      <ul css={{ fontFamily: options.headerFontFamily.join(`,`) }} >
        <li>
          <b>Traditional static site generators</b> such as <a href="http://jekyllrb.com/">Jekyll</a> let you put text or markdown in a specific directory such as <code>pages/</code> in a version-controlled codebase. They then build a specific kind of site, usually a blog, as HTML files from the content you've added. These files can be cached and served from a CDN.
        </li>
        <li>
          <b>Content Management Systems</b> (CMSs) like <a href="http://wordpress.org/">Wordpress</a> give you an online text editor to create content. You customize the look and feel through choosing themes and plugins, or writing custom PHP or Javascript code. Content is saved in a database, which is retrieved and sent to users when they visit the website. Depending onYou can self-host your website, or use an official hosting provider.
        </li>
        <li>
          <b>Site builders</b> like <a href="http://squarespace.com/">Squarespace</a> are a type of hosted closed-source CMS. They focus on making it fast to build a website; however, they don't allow self-hosting or enable you to export your website and customize it.
        </li>
      </ul>
      <FuturaParagraph>
        The chart below details Gatsby's capabilities in comparison with a representative from each category. Click on any row to see a more detailed explanation on that feature and our rating for each system.
      </FuturaParagraph>
      <h6 css={{ textTransform: `uppercase` }}>Legend</h6>
      <LegendTable />
    </div>
  )
}

const getFeaturesData = function(data){
  const sections = (data || [])
    .map((row, i) => row.node.Category ? i : -1)
    .filter(rowNum => rowNum !== -1)
    .map((rowNum, i, arr) => {
      if (i < arr.length - 1) {
        return [rowNum, arr[i+1]]
      }

      return [rowNum, data.length]
    })
    .map(bounds => data.slice(bounds[0], bounds[1]))

  const sectionHeaders = (data || [])
    .filter(row => row.node.Category)
    .map(row => row.node.Category)

  return {
    sectionHeaders,
    sections,
  }
}

class FeaturesPage extends Component {
  render() {
    const { sections, sectionHeaders } = getFeaturesData(this.props.data.allGatsbySpecsCsv.edges)

    return (
      <Container>
        <FeaturesHeader />
        <EvaluationTable
          sections={sections}
          sectionHeaders={sectionHeaders}
        />
      </Container>
    )
  }
}

export default FeaturesPage

export const pageQuery = graphql`
  query EvaluationTableQuery {
    allGatsbySpecsCsv {
      edges {
        node {
          Category
          Subcategory
          Feature
          Gatsby
          Wordpress
          Squarespace
          Jekyll
          Description
        }
      }
    }
  }
`