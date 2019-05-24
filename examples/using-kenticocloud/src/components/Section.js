import React from 'react'

import HeaderSection from './HeaderSection'
import VideoSection from './VideoSection'
import FeaturesSection from './FeaturesSection'
import ThreeColumnsSection from './ThreeColumnsSection'
import CtaSection from './CTASection'
import FooterSection from './FooterSection'

const Section = props => {
  switch (props.data.__typename) {
    case 'KenticoCloudItemHeaderSection':
      return <HeaderSection {...props.data} />
    case 'KenticoCloudItemVideoSection':
      return <VideoSection {...props.data} />
    case 'KenticoCloudItemFeaturesSection':
      return <FeaturesSection {...props.data} />
    case 'KenticoCloudItemThreeColumnsSection':
      return <ThreeColumnsSection {...props.data} />
    case 'KenticoCloudItemCtaSection':
      return <CtaSection {...props.data} />
    case 'KenticoCloudItemFooterSection':
      return <FooterSection {...props.data} />
    default:
      return <div>Unknown section!</div>
  }
}

export default Section
