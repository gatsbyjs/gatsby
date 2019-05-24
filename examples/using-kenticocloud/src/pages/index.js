import React from 'react'
import Helmet from 'react-helmet'

import { StaticQuery, graphql } from 'gatsby'
import Layout from '../components/layout'
import Section from '../components/Section'

class Homepage extends React.Component {
  render() {
    return (
      <StaticQuery
        query={graphql`
          {
            kenticoCloudItemSectionsPage(
              system: { codename: { eq: "home_page" } }
            ) {
              elements {
                sections {
                  ... on Node {
                    ... on KenticoCloudItemHeaderSection {
                      elements {
                        primary_text {
                          value
                        }
                        secondary_text {
                          value
                        }
                        logo {
                          assets {
                            url
                          }
                        }
                        url {
                          value
                        }
                        text {
                          value
                        }
                      }
                    }
                    ... on KenticoCloudItemVideoSection {
                      system {
                        codename
                      }
                      elements {
                        primary_text {
                          value
                        }
                        secondary_text {
                          value
                        }
                        youtube_id {
                          value
                        }
                      }
                    }
                    ... on KenticoCloudItemFeaturesSection {
                      elements {
                        primary_text {
                          value
                        }
                        secondary_text {
                          value
                        }
                        icons {
                          ... on Node {
                            ... on KenticoCloudItemIcon {
                              system {
                                id
                              }
                              elements {
                                code {
                                  value
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    ... on KenticoCloudItemThreeColumnsSection {
                      elements {
                        primary_text {
                          value
                        }
                        secondary_text {
                          value
                        }
                        detail_text {
                          value
                        }
                        columns {
                          ... on Node {
                            ... on KenticoCloudItemBlogPost {
                              system {
                                id
                              }
                              elements {
                                title {
                                  value
                                }
                                slug {
                                  value
                                }
                                summary {
                                  value
                                }
                                image {
                                  assets {
                                    name
                                    url
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    ... on KenticoCloudItemCtaSection {
                      elements {
                        primary_text {
                          value
                        }
                        secondary_text {
                          value
                        }
                        buttons {
                          ... on Node {
                            ... on KenticoCloudItemButton {
                              system {
                                id
                              }
                              elements {
                                text {
                                  value
                                }
                                url {
                                  value
                                }
                                special {
                                  value {
                                    codename
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    ... on KenticoCloudItemFooterSection {
                      elements {
                        icons {
                          ... on Node {
                            ... on KenticoCloudItemLinkIcon {
                              system {
                                id
                              }
                              elements {
                                text {
                                  value
                                }
                                url {
                                  value
                                }
                                icon {
                                  ... on Node {
                                    ... on KenticoCloudItemIcon {
                                      elements {
                                        code {
                                          value
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                        copyright {
                          value
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `}
        render={({ kenticoCloudItemSectionsPage }) => {
          const sections = kenticoCloudItemSectionsPage.elements.sections.map(
            (section, index) => <Section key={index} data={section} />
          )

          return (
            <Layout>
              <Helmet
                title={
                  kenticoCloudItemSectionsPage.elements.sections[0].elements
                    .primary_text.value
                }
              />
              {sections}
            </Layout>
          )
        }}
      />
    )
  }
}

export default Homepage
