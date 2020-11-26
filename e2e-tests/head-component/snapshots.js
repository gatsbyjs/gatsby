module.exports = {
  "__version": "3.8.3",
  "head": {
    "renders the meta tags in the head": {
      "1": "<title data-react-helmet=\"true\">Custom Title</title>",
      "2": "<meta data-react-helmet=\"true\"\n  name=\"twitter:title\"\n  content=\"Custom Title\">",
      "3": "<meta data-react-helmet=\"true\"\n  property=\"og:title\"\n  content=\"Custom Title\">",
      "4": "<meta data-react-helmet=\"true\"\n  name=\"description\"\n  content=\"Custom description\">",
      "5": "<meta data-react-helmet=\"true\"\n  name=\"twitter:description\"\n  content=\"Custom description\">",
      "6": "<meta data-react-helmet=\"true\"\n  property=\"og:description\"\n  content=\"Custom description\">",
      "7": "<meta data-react-helmet=\"true\"\n  name=\"twitter:image\"\n  content=\"/custom-image.png\">",
      "8": "<meta data-react-helmet=\"true\"\n  property=\"og:image\"\n  content=\"/custom-image.png\">",
      "9": "<meta data-react-helmet=\"true\"\n  name=\"twitter:card\"\n  content=\"summary_large_image\">",
      "10": "<meta data-react-helmet=\"true\"\n  property=\"og:type\"\n  content=\"website\">",
      "11": "<meta data-react-helmet=\"true\"\n  property=\"og:url\">"
    }
  },
  "no-head": {
    "renders the meta tags based on the siteMetdata": {
      "1": "<title data-react-helmet=\"true\">SiteMetadata Title</title>",
      "2": "<meta data-react-helmet=\"true\"\n  name=\"twitter:title\"\n  content=\"SiteMetadata Title\">",
      "3": "<meta data-react-helmet=\"true\"\n  property=\"og:title\"\n  content=\"SiteMetadata Title\">",
      "4": "<meta data-react-helmet=\"true\"\n  name=\"description\"\n  content=\"SiteMetadata Description\">",
      "5": "<meta data-react-helmet=\"true\"\n  name=\"twitter:description\"\n  content=\"SiteMetadata Description\">",
      "6": "<meta data-react-helmet=\"true\"\n  property=\"og:description\"\n  content=\"SiteMetadata Description\">",
      "7": "<meta data-react-helmet=\"true\"\n  name=\"twitter:image\"\n  content=\"https://sitemetadata.com/image.png\">",
      "8": "<meta data-react-helmet=\"true\"\n  property=\"og:image\"\n  content=\"https://sitemetadata.com/image.png\">",
      "9": "<meta data-react-helmet=\"true\"\n  name=\"twitter:card\"\n  content=\"summary_large_image\">",
      "10": "<meta data-react-helmet=\"true\"\n  property=\"og:type\"\n  content=\"website\">",
      "11": "<meta data-react-helmet=\"true\"\n  property=\"og:url\">",
      "12": "<title data-react-helmet=\"true\"></title>"
    }
  }
}
