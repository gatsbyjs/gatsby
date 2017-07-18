import React from 'react';
import SiteSidebar from '../components/SiteSidebar';
// It would be nice to have props with data that we
//  that we could push down into the sidebar. We can't
//  so we just cheat and pull it out of a yaml for the
//  time being.

class InsetPageTemplate extends React.Component {
  render() {
    return (
        <div className='PageTemplate'>
          <div className='section'>
            <div className='columns'>
              <div className='column is-one-quarter'>
                <SiteSidebar {...this.props}/>
              </div>
              <div className='column'>
                <div className='box'>
                  { this.props.children() }
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}

export default InsetPageTemplate;
