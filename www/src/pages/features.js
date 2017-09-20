import React, { Component } from 'react';
import EvaluationTable from '../components/evaluation-table';

class AboutPage extends Component {
  render() {
    return (
        <div className="about-container">
          <p>About me.</p>
          <EvaluationTable
            data={this.props.data.allGatsbySpecsCsv.edges}
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