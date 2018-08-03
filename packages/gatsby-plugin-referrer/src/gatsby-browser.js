exports.onClientEntry = function() {
  if (document.cookie.indexOf(`gatsbyOriginalReferrer`) < 0) {
    // create cookie
    document.cookie = `gatsbyOriginalReferrer=${
      document.referrer
    };path=/;max-age=31536000`
  }
}
