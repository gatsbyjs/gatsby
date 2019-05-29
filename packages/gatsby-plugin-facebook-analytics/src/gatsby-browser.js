export const onRouteUpdate = () => {
  // Don't track while developing.
  if (process.env.NODE_ENV === `production` && typeof FB === `function`) {
    window.FB.AppEvents.logPageView()
  }
}
