import React, { Component } from 'react';
import EvaluationTable from '../components/evaluation-table';
import EvaluationCell from '../components/evaluation-cell';
import FuturaParagraph from "../components/futura-paragraph"

class AboutPage extends Component {
  render() {
    const header = (
      <div css={{ textAlign: "left"}}>
        <div css={{maxWidth: 600}}>
          <h1>Features</h1>
          <FuturaParagraph>
            Gatsby is a tremendously powerful framework compared to its alternatives. Traditional static site generators lack performance and extensibility. Open-source CMS-es lack performance and an optimized development workflow.
            Site generators lack extensibility and lock you into a closed-source vendor.
          </FuturaParagraph>
          <br/>
          <FuturaParagraph>
            The chart below details Gatsby's capabilities in comparison with a representative sample from each of the categories: Jekyll, Wordpress, and Squarespace.
          </FuturaParagraph>
        </div>
        <h4>Legend</h4>
        <div css={{display: `table`, border: `1px solid #dddddd`, borderLeft: 0}}>
          <div css={{display: `table-row`}}>
            <div css={{display: `table-cell`, verticalAlign: `middle`, padding: 10, borderLeft: `1px solid #dddddd`, borderBottom: `1px solid #dddddd` }}>
              <h5 style={{marginTop: 0}}>Icon</h5>
            </div>
            <div css={{display: `table-cell`, verticalAlign: `middle`, padding: 10, borderLeft: `1px solid #dddddd`, borderBottom: `1px solid #dddddd` }}>
              <EvaluationCell
                num={"3"}
              />
            </div>
            <div css={{display: `table-cell`, verticalAlign: `middle`, padding: 10, borderLeft: `1px solid #dddddd`, borderBottom: `1px solid #dddddd` }}>
              <EvaluationCell
                num={"2"}
              />
            </div>
            <div css={{display: `table-cell`, verticalAlign: `middle`, padding: 10, borderLeft: `1px solid #dddddd`, borderBottom: `1px solid #dddddd` }}>
              <EvaluationCell
                num={"1"}
              />
            </div>
            <div css={{display: `table-cell`, verticalAlign: `middle`, padding: 10, borderLeft: `1px solid #dddddd`, borderBottom: `1px solid #dddddd` }}>
              <EvaluationCell
                num={"0"}
              />
            </div>
          </div>
          <div css={{display: `table-row`}}>
            <div css={{display: `table-cell`, verticalAlign: `middle`, padding: 10, borderLeft: `1px solid #dddddd`}}>
              <h5 style={{marginTop: 0}}>Feature Availability</h5>
            </div>
            <div css={{display: `table-cell`, verticalAlign: `middle`, padding: 10, borderLeft: `1px solid #dddddd`}}>
              Out of the box
            </div>
            <div css={{display: `table-cell`, verticalAlign: `middle`, padding: 10, borderLeft: `1px solid #dddddd`}}>
              Plugins available
            </div>
            <div css={{display: `table-cell`, verticalAlign: `middle`, padding: 10, borderLeft: `1px solid #dddddd`}}>
              Needs customization
            </div>
            <div css={{display: `table-cell`, verticalAlign: `middle`, padding: 10, borderLeft: `1px solid #dddddd`}}>
              Not possible
            </div>
          </div>
        </div>
      </div>

    )


    return (
        <div className="about-container" css={{textAlign: "center"}}>
          <EvaluationTable
            data={this.props.data.allGatsbySpecsCsv.edges}
            header={header}
          />
        </div>
    );
  }
}

export default AboutPage;

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
        }
      }
    }
  }
`