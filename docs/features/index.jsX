import React, { Component } from 'react';

class AboutPage extends Component {
  render() {
    const config = this.props.data.site.siteMetadata;
    return (
        <div className="about-container">
          <p>About me.</p>
        </div>
    );
  }
}

export default AboutPage;