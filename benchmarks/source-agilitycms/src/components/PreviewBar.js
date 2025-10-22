import React, { Component } from 'react';

import './PreviewBar.css'

function PreviewBar({isPreview}) {
  function clearPreviewMode() {
    window.location.href = "?AgilityPreview=0";
  }

  if (isPreview === 'true') {
return (<div id="agility-preview-bar" title="You are currently in Preview Mode.">Preview Mode</div>)
} else {
return null;
}
}

export default PreviewBar;
