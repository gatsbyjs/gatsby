import React, { Component } from 'react';

import './PreviewBar.css'

class PreviewBar extends Component {

  clearPreviewMode() {
    window.location.href = "?AgilityPreview=0";
  }

  render() {
    if (this.props.isPreview === 'true') {
      return (<div id="agility-preview-bar" title="You are currently in Preview Mode.">Preview Mode</div>)
    } else {
      return null;
    }
  }
}

export default PreviewBar;
