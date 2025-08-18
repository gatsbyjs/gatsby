exports.queries = {
  nodeCounts: /* GraphQL */ `
    {
      allWpMenu {
        totalCount
      }
      allWpTag {
        totalCount
      }
      allWpUser {
        totalCount
      }
      allWpPage {
        totalCount
      }
      allWpPost {
        totalCount
      }
      allWpComment {
        totalCount
      }
      allWpTaxonomy {
        totalCount
      }
      allWpCategory {
        totalCount
      }
      allWpUserRole {
        totalCount
      }
      allWpMenuItem {
        totalCount
      }
      allWpMediaItem(
        sort: { id: ASC }
        # this node "cG9zdDoxOTU=" only exists on warm builds. So our snapshot is wrong if we don't filter it out.
        filter: { id: { ne: "cG9zdDoxOTU=" } }
      ) {
        totalCount
        nodes {
          id
          mediaItemUrl
        }
      }
      allWpPostFormat {
        totalCount
      }
      allWpContentType {
        totalCount
      }
    }
  `,
  acfData: /* GraphQL */ `
    {
      wpPage(title: { eq: "ACF Field Test" }) {
        acfPageFields {
          buttonGroupField
          checkboxField
          colorPickerField
          datePickerField
          dateTimePickerField
          fieldGroupName
          fileField {
            node {
              id
              title
            }
          }
          galleryField {
            nodes {
              id
              title
            }
          }
          googleMapField {
            city
            country
            countryShort
            latitude
            longitude
            placeId
            postCode
            state
            stateShort
            streetAddress
            streetName
            streetNumber
            zoom
          }
          groupField {
            fieldGroupName
          }
          imageField {
            node {
              id
              title
            }
          }
          oembedField
          radioButtonField
          rangeField
          repeaterField {
            fieldGroupName
          }
          selectField
          textAreaField
          textField
          timePicker
          trueFalseField
          userField {
            nodes {
              id
              name
            }
          }
          relationshipField {
            nodes {
              ... on WpPost {
                id
                title
              }
              ... on WpPage {
                id
                title
              }
            }
          }
          postObjectField {
            nodes {
              ... on WpPost {
                id
                title
              }
              ... on WpPage {
                id
                title
              }
            }
          }
          pageLinkField {
            nodes {
              ... on WpPage {
                id
                title
              }
              ... on WpPost {
                id
                title
              }
            }
          }
          flexibleContentField {
            ... on WpAcfPageFieldsFlexibleContentFieldFlexLayout1Layout {
              fieldGroupName
              flexImage {
                node {
                  title
                }
              }
              flexRelationship {
                nodes {
                  ... on WpPost {
                    title
                  }
                }
              }
              flexRepeater {
                fieldGroupName
                flexRepeaterTitle
              }
            }
          }
          repeaterField {
            repeaterFlex {
              ... on WpAcfPageFieldsRepeaterFieldRepeaterFlexRepeaterFlexTitleLayoutLayout {
                repeaterFlexTitle
              }
              ... on WpAcfPageFieldsRepeaterFieldRepeaterFlexRepeaterFlexRelationshipLayoutLayout {
                repeaterFlexRelationship {
                  nodes {
                    ... on WpPage {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  gutenbergColumns: /* GraphQL */ `
    fragment WpCoreColumnBlock on WpCoreColumn {
      name
      isDynamic
      attributes {
        className
        verticalAlignment
        width
      }
    }

    fragment WpCoreColumnsBlock on WpCoreColumns {
      name
      attributes {
        align
        backgroundColor
        className
        textColor
        verticalAlignment
      }
    }

    fragment InnerBlocks on WpEditorBlock {
      ... on WpCoreColumn {
        ...WpCoreColumnBlock
      }
      ... on WpCoreColumns {
        ...WpCoreColumnsBlock
      }
    }

    query POST_QUERY {
      wpPost(title: { eq: "Gutenberg: Columns" }) {
        editorBlocks {
          ... on WpCoreColumns {
            ...WpCoreColumnsBlock
          }
          innerBlocks {
            ...InnerBlocks
            innerBlocks {
              ...InnerBlocks
              innerBlocks {
                ...InnerBlocks
              }
            }
          }
        }
      }
    }
  `,
  gutenbergLayoutElements: /* GraphQL */ `
    {
      wpPost(id: { eq: "cG9zdDoxMjU=" }) {
        title
        editorBlocks {
          name
          ... on WpCoreButton {
            attributes {
              align
              backgroundColor
              className
              gradient
              linkTarget
              placeholder
              rel
              text
              textColor
              title
              url
            }
          }
          ... on WpCoreSeparator {
            attributes {
              className
            }
          }
        }
      }
    }
  `,
  gutenbergFormattingBlocks: /* GraphQL */ `
    {
      wpPost(id: { eq: "cG9zdDoxMjI=" }) {
        title
        editorBlocks {
          name
          ... on WpCoreCode {
            renderedHtml
            attributes {
              content
            }
          }
          ... on WpCoreFreeform {
            attributes {
              content
            }
          }
          ... on WpCoreHtml {
            attributes {
              content
            }
          }
          ... on WpCorePullquote {
            attributes {
              citation
              value
            }
          }
          ... on WpCoreTable {
            attributes {
              body {
                cells {
                  content
                  scope
                  tag
                }
              }
              caption
              foot {
                cells {
                  content
                  scope
                  tag
                }
              }
              hasFixedLayout
              head {
                cells {
                  content
                  scope
                  tag
                }
              }
            }
          }
        }
      }
    }
  `,
  gutenbergCommonBlocks: /* GraphQL */ `
    {
      wpPost(id: { eq: "cG9zdDo5NA==" }) {
        editorBlocks {
          name
          ... on WpCoreParagraph {
            attributes {
              content
            }
          }
          ... on WpCoreHeading {
            attributes {
              content
              level
            }
          }
          ... on WpCoreImage {
            attributes {
              url
            }
          }
          ... on WpCoreGallery {
            attributes {
              images {
                id
                url
              }
            }
          }
        }
      }
    }
  `,
  yoastRootFields: /* GraphQL */ `
  seo {
    breadcrumbs {
      archivePrefix
      boldLast
      enabled
      homeText
      notFoundText
      prefix
      searchPrefix
      separator
      showBlogPage
    }
    openGraph {
      defaultImage {
        id
        title
      }
      frontPage {
        description
        image {
          id
          title
        }
        title
      }
    }
    redirects {
      format
      origin
      target
      type
    }
    schema {
      companyLogo {
        id
        title
      }
      companyName
      companyOrPerson
      inLanguage
      logo {
        id
        title
      }
      siteName
      siteUrl
      wordpressSiteName
      personLogo {
        id
        title
      }
    }
    social {
      facebook {
        url
        defaultImage {
          title
          id
        }
      }
      instagram {
        url
      }
      linkedIn {
        url
      }
      mySpace {
        url
      }
      pinterest {
        url
        metaTag
      }
      twitter {
        cardType
        username
      }
      wikipedia {
        url
      }
      youTube {
        url
      }
    }
    webmaster {
      baiduVerify
      googleVerify
      msVerify
      yandexVerify
    }
  }
`,
  pageYoastFields: /* GraphQL */ `
    seo {
      breadcrumbs {
        text
      }
      canonical
      focuskw
      metaDesc
      metaKeywords
      metaRobotsNofollow
      metaRobotsNoindex
      opengraphAuthor
      opengraphDescription
      opengraphImage {
        id
        title
      }
      opengraphModifiedTime
      opengraphPublishedTime
      opengraphPublisher
      opengraphSiteName
      opengraphTitle
      opengraphType
      title
      twitterDescription
      twitterTitle
    }
  `,
  menus: /* GraphQL */ `
    {
      allWpMenu {
        nodes {
          name
          count
          id
          databaseId
          menuItems {
            nodes {
              id
              label
              databaseId
              target
              title
              url
              childItems {
                nodes {
                  label
                  id
                  databaseId
                  connectedNode {
                    node {
                      ... on WpPost {
                        title
                        uri
                        featuredImage {
                          node {
                            title
                          }
                        }
                      }
                    }
                  }
                  childItems {
                    nodes {
                      label
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  pages: /* GraphQL */ `
    {
      testPage: wpPage(id: { eq: "cG9zdDoy" }) {
        title
      }
      allWpPage(sort: { date: ASC }) {
        nodes {
          uri
          title
          wpChildren {
            nodes {
              ... on WpNodeWithTitle {
                title
              }
            }
          }
          author {
            node {
              name
            }
          }
          # TODO: re-enable translations tests once a test plugin support it
          # translations {
          #   title
          # }
          acfPageFields {
            fieldGroupName
          }
        }
      }
    }
  `,
  posts: /* GraphQL */ `
    {
      testPost: wpPost(id: { eq: "cG9zdDox" }) {
        title
      }
      allWpPost(sort: { date: ASC }) {
        nodes {
          title
          featuredImage {
            node {
              altText
              sourceUrl
            }
          }
          author {
            node {
              avatar {
                url
              }
              comments {
                nodes {
                  content
                }
              }
            }
          }
        }
      }
    }
  `,
  users: /* GraphQL */ `
    {
      testUser: wpUser(id: { eq: "dXNlcjo0" }) {
        name
      }
      allWpUser {
        nodes {
          name
          databaseId
          pages {
            nodes {
              title
            }
          }
          posts {
            nodes {
              title
            }
          }
        }
      }
    }
  `,
  rootFields: /* GraphQL */ `
    {
      wp {
        allSettings {
          discussionSettingsDefaultCommentStatus
          discussionSettingsDefaultPingStatus
          generalSettingsDateFormat
          generalSettingsDescription
          generalSettingsLanguage
          generalSettingsStartOfWeek
          generalSettingsTimeFormat
          generalSettingsTimezone
          generalSettingsTitle
          generalSettingsUrl
          readingSettingsPostsPerPage
          writingSettingsDefaultCategory
          writingSettingsDefaultPostFormat
          writingSettingsUseSmilies
        }
        writingSettings {
          defaultCategory
          defaultPostFormat
          useSmilies
        }
      }
    }
  `,
}
